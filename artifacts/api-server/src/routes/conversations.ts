import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { chatCompletion } from "../lib/ai";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";

const router = Router();

const createConversationBody = z.object({
  aiEmployeeId: z.number().int().min(1),
  title: z.string().optional(),
});

const sendMessageBody = z.object({
  content: z.string().min(1).max(10000),
});

router.get("/conversations", requireAuth, validate({ query: paginationQuery }), async (req, res) => {
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
      const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, conv.aiEmployeeId));
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
    res.status(500).json({ error: "Failed to list conversations", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/conversations", requireAuth, validate({ body: createConversationBody }), async (req, res) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(400).json({ error: "No org or user", code: "BAD_REQUEST", statusCode: 400 });

    const { aiEmployeeId, title } = req.body;

    const [emp] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, aiEmployeeId), eq(aiEmployees.orgId, orgId)));
    if (!emp) return res.status(404).json({ error: "Employee not found in your organization", code: "NOT_FOUND", statusCode: 404 });

    const [conv] = await db.insert(conversations).values({
      orgId, userId, aiEmployeeId, title,
    }).returning();

    res.status(201).json({ ...conv, aiEmployee: emp });
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.get("/conversations/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, id), eq(conversations.orgId, orgId), eq(conversations.userId, userId))
    );
    if (!conv) return res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND", statusCode: 404 });

    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id));
    const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, conv.aiEmployeeId));
    let role = null;
    if (emp) {
      [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
    }

    res.json({ ...conv, messages: msgs, aiEmployee: emp ? { ...emp, role } : null });
  } catch (error) {
    res.status(500).json({ error: "Failed to get conversation", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/conversations/:id/messages", requireAuth, validate({ params: idParam, body: sendMessageBody }), async (req, res) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const convId = parseInt(String(req.params.id));
    const { content } = req.body;

    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, convId), eq(conversations.orgId, orgId), eq(conversations.userId, userId))
    );
    if (!conv) return res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND", statusCode: 404 });

    const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, conv.aiEmployeeId));
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

    const [aiMsg] = await db.insert(messages).values({
      conversationId: convId, role: "assistant", content: aiResponse,
    }).returning();

    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, convId));

    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown";
    res.status(500).json({ error: "Failed to send message: " + message, code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

export default router;
