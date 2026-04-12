import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { chatCompletion } from "../lib/ai";
import { textToSpeech } from "../lib/elevenlabs";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../lib/logger";
import { publishEvent } from "../lib/websocket";
import { recordUsage } from "../lib/billing/metering";

const router = Router();

const createConversationBody = z.object({
  aiEmployeeId: z.number().int().min(1),
  title: z.string().optional(),
});

const sendMessageBody = z.object({
  content: z.string().min(1).max(10000),
});

router.get("/conversations", requireAuth, validate({ query: paginationQuery }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.json(emptyPagination());

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const where = and(eq(conversations.orgId, orgId), eq(conversations.userId, userId));
    const data = await db.select().from(conversations).where(where).orderBy(desc(conversations.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(conversations).where(where);

    const enriched = await Promise.all(data.map(async (conv) => {
      const [emp] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, conv.aiEmployeeId), eq(aiEmployees.orgId, orgId)));
      let role = null;
      if (emp) {
        [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
      }
      return { ...conv, aiEmployee: emp ? { ...emp, role } : null };
    }));

    res.json({
      data: enriched,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/conversations", requireAuth, validate({ body: createConversationBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.badRequest("No org or user");

    const { aiEmployeeId, title } = req.body;

    const [emp] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, aiEmployeeId), eq(aiEmployees.orgId, orgId)));
    if (!emp) throw AppError.notFound("Employee not found in your organization");

    const [conv] = await db.insert(conversations).values({
      orgId, userId, aiEmployeeId, title,
    }).returning();

    publishEvent(orgId, "conversations", "conversation:message", { ...conv, aiEmployee: emp });
    res.status(201).json({ ...conv, aiEmployee: emp });
  } catch (error) {
    next(error);
  }
});

router.get("/conversations/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, id), eq(conversations.orgId, orgId), eq(conversations.userId, userId))
    );
    if (!conv) throw AppError.notFound("Conversation not found");

    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id));
    const [emp] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, conv.aiEmployeeId), eq(aiEmployees.orgId, orgId)));
    let role = null;
    if (emp) {
      [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
    }

    res.json({ ...conv, messages: msgs, aiEmployee: emp ? { ...emp, role } : null });
  } catch (error) {
    next(error);
  }
});

router.post("/conversations/:id/messages", requireAuth, validate({ params: idParam, body: sendMessageBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden();

    const convId = parseInt(String(req.params.id));
    const { content } = req.body;

    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, convId), eq(conversations.orgId, orgId), eq(conversations.userId, userId))
    );
    if (!conv) throw AppError.notFound("Conversation not found");

    const [emp] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, conv.aiEmployeeId), eq(aiEmployees.orgId, orgId)));
    const role = emp ? (await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId)))[0] : null;

    const [userMsg] = await db.insert(messages).values({
      conversationId: convId, role: "user", content,
    }).returning();

    const history = await db.select().from(messages).where(eq(messages.conversationId, convId));

    const systemPrompt = `You are ${emp?.name || "an AI Employee"}, a ${role?.title || "professional AI employee"} working at this organization.
${role?.description || "You help with professional tasks."}
Be helpful, professional, and demonstrate expertise in your role. Keep responses concise and actionable.`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const aiResponse = await chatCompletion(chatMessages);

    let audioUrl: string | null = null;
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceId = emp?.voiceId || "21m00Tcm4TlvDq8ikWAM";
        const audioBuffer = await textToSpeech(aiResponse.slice(0, 5000), { voiceId });
        const base64Audio = audioBuffer.toString("base64");
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      } catch (ttsErr) {
        logger.warn({ err: ttsErr }, "TTS generation failed, continuing without audio");
      }
    }

    const [aiMsg] = await db.insert(messages).values({
      conversationId: convId, role: "assistant", content: aiResponse, audioUrl,
    }).returning();

    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, convId));

    await recordUsage(orgId, "messages", 2, { conversationId: convId });
    if (audioUrl) {
      const estimatedMinutes = Math.ceil(aiResponse.length / 800);
      await recordUsage(orgId, "voice_hours", estimatedMinutes, { conversationId: convId, type: "tts" });
    }

    publishEvent(orgId, "conversations", "conversation:message", { conversationId: convId, userMessage: userMsg, aiMessage: aiMsg });
    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (error) {
    next(error);
  }
});

export default router;
