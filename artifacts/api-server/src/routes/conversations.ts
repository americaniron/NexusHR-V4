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
import { requirePlanLimit } from "../middlewares/planLimits";
import { analyzeEmotion, detectMessageType, extractQuickReplies } from "../lib/emotionEngine";
import { detectTaskIntent, shouldCreateTaskFromConversation } from "../lib/intentDetection";
import { tasks } from "@workspace/db";

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

router.post("/conversations/:id/messages", requireAuth, requirePlanLimit("messages", 2), validate({ params: idParam, body: sendMessageBody }), async (req, res, next) => {
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

    const emotionAnalysis = analyzeEmotion(aiResponse);
    const msgType = detectMessageType(aiResponse);
    const quickReplies = extractQuickReplies(aiResponse);

    const aiMetadata: Record<string, unknown> = {
      emotion: emotionAnalysis.primary,
      emotionIntensity: emotionAnalysis.intensity,
    };
    if (quickReplies.length > 0) {
      aiMetadata.quickReplies = quickReplies;
    }

    let audioUrl: string | null = null;
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceId = emp?.voiceId || "21m00Tcm4TlvDq8ikWAM";
        const audioBuffer = await textToSpeech(aiResponse.slice(0, 5000), {
          voiceId,
          stability: emotionAnalysis.voiceParams.stability,
          style: emotionAnalysis.voiceParams.style,
          speed: emotionAnalysis.voiceParams.speed,
        });
        const base64Audio = audioBuffer.toString("base64");
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      } catch (ttsErr) {
        logger.warn({ err: ttsErr }, "TTS generation failed, continuing without audio");
      }
    }

    const taskIntent = detectTaskIntent(aiResponse);
    if (shouldCreateTaskFromConversation(taskIntent)) {
      aiMetadata.taskIntent = {
        title: taskIntent.title,
        description: taskIntent.description,
        priority: taskIntent.priority,
        category: taskIntent.category,
        confidence: taskIntent.confidence,
      };
    }

    const finalMsgType = shouldCreateTaskFromConversation(taskIntent) ? "action_confirmation" : msgType;
    if (shouldCreateTaskFromConversation(taskIntent)) {
      aiMetadata.actionType = "create_task";
      aiMetadata.actionLabel = `Create task: ${taskIntent.title}`;
    }

    const [aiMsg] = await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: aiResponse,
      messageType: finalMsgType,
      metadata: aiMetadata,
      audioUrl,
    }).returning();

    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, convId));

    await recordUsage(orgId, "messages", 2, { conversationId: convId });
    if (audioUrl) {
      const estimatedMinutes = Math.ceil(aiResponse.length / 800);
      await recordUsage(orgId, "voice_hours", estimatedMinutes, { conversationId: convId, type: "tts", unit: "minutes" });
    }

    publishEvent(orgId, "conversations", "conversation:message", { conversationId: convId, userMessage: userMsg, aiMessage: aiMsg });
    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (error) {
    next(error);
  }
});

const confirmTaskBody = z.object({
  messageId: z.number().int().min(1),
  action: z.enum(["approve", "reject"]),
});

router.post("/conversations/:id/confirm-task", requireAuth, validate({ params: idParam, body: confirmTaskBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden();

    const convId = parseInt(String(req.params.id));
    const { messageId, action } = req.body;

    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, convId), eq(conversations.orgId, orgId), eq(conversations.userId, userId))
    );
    if (!conv) throw AppError.notFound("Conversation not found");

    const [msg] = await db.select().from(messages).where(
      and(eq(messages.id, messageId), eq(messages.conversationId, convId))
    );
    if (!msg) throw AppError.notFound("Message not found");

    const meta = (msg.metadata || {}) as Record<string, unknown>;
    const taskIntent = meta.taskIntent as { title: string; description: string; priority: string; category: string } | undefined;

    if (!taskIntent) {
      throw AppError.badRequest("No task intent found in this message");
    }

    if (meta.actionStatus === "approved" || meta.actionStatus === "rejected") {
      res.json({ status: meta.actionStatus as string, alreadyProcessed: true, taskId: meta.taskId ?? null });
      return;
    }

    if (action === "reject") {
      const claimResult = await db.execute(sql`
        UPDATE messages
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{actionStatus}',
          '"rejected"'::jsonb
        )
        WHERE id = ${messageId}
          AND conversation_id = ${convId}
          AND (metadata->>'actionStatus' IS NULL OR metadata->>'actionStatus' = 'pending')
        RETURNING metadata
      `);

      if (!claimResult.rows || claimResult.rows.length === 0) {
        const [freshMsg] = await db.select().from(messages).where(eq(messages.id, messageId));
        const freshMeta = (freshMsg?.metadata || {}) as Record<string, unknown>;
        res.json({ status: freshMeta.actionStatus as string, alreadyProcessed: true, taskId: freshMeta.taskId ?? null });
        return;
      }

      const [statusMsg] = await db.insert(messages).values({
        conversationId: convId,
        role: "assistant",
        content: "Understood — I won't create a task for that. Let me know if you need anything else.",
        messageType: "status_update",
        metadata: { progressPercent: 0, progressLabel: "Task creation declined" },
      }).returning();

      res.json({ status: "rejected", message: statusMsg });
      return;
    }

    const claimResult = await db.execute(sql`
      UPDATE messages
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{actionStatus}',
        '"processing"'::jsonb
      )
      WHERE id = ${messageId}
        AND conversation_id = ${convId}
        AND (metadata->>'actionStatus' IS NULL OR metadata->>'actionStatus' = 'pending')
      RETURNING metadata
    `);

    if (!claimResult.rows || claimResult.rows.length === 0) {
      const [freshMsg] = await db.select().from(messages).where(eq(messages.id, messageId));
      const freshMeta = (freshMsg?.metadata || {}) as Record<string, unknown>;
      res.json({ status: freshMeta.actionStatus as string, alreadyProcessed: true, taskId: freshMeta.taskId ?? null });
      return;
    }

    try {
      const [task] = await db.insert(tasks).values({
        orgId,
        assigneeId: conv.aiEmployeeId,
        createdById: userId,
        title: taskIntent.title,
        description: taskIntent.description,
        priority: taskIntent.priority,
        category: taskIntent.category,
        metadata: { sourceConversationId: convId, sourceMessageId: messageId },
      }).returning();

      await db.execute(sql`
        UPDATE messages
        SET metadata = jsonb_set(
          jsonb_set(COALESCE(metadata, '{}'::jsonb), '{actionStatus}', '"approved"'::jsonb),
          '{taskId}',
          ${task.id}::text::jsonb
        )
        WHERE id = ${messageId}
      `);

      const [confirmMsg] = await db.insert(messages).values({
        conversationId: convId,
        role: "assistant",
        content: `Task created: "${task.title}" (Priority: ${task.priority}). I'll get started on this right away.`,
        messageType: "status_update",
        metadata: { progressPercent: 100, progressLabel: "Task created", taskId: task.id },
      }).returning();

      publishEvent(orgId, "tasks", "task:created", { task });
      publishEvent(orgId, "conversations", "conversation:message", { conversationId: convId, aiMessage: confirmMsg });

      res.json({ status: "approved", task, message: confirmMsg });
    } catch (taskErr) {
      await db.execute(sql`
        UPDATE messages
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{actionStatus}',
          '"pending"'::jsonb
        )
        WHERE id = ${messageId}
          AND metadata->>'actionStatus' = 'processing'
      `);
      throw taskErr;
    }
  } catch (error) {
    next(error);
  }
});

export default router;
