import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, aiEmployees, aiEmployeeRoles, organizations, users } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";
import { chatCompletion } from "../lib/openai";

const router = Router();

async function getOrgAndUser(req: any) {
  const auth = getAuth(req);
  const clerkOrgId = auth?.orgId;
  const clerkUserId = auth?.userId;
  if (!clerkOrgId || !clerkUserId) return { orgId: null, userId: null };
  const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return { orgId: org?.id || null, userId: user?.id || null };
}

router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const { orgId, userId } = await getOrgAndUser(req);
    if (!orgId || !userId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

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
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/conversations", requireAuth, async (req, res) => {
  try {
    const { orgId, userId } = await getOrgAndUser(req);
    if (!orgId || !userId) return res.status(400).json({ error: "No org or user" });

    const { aiEmployeeId, title } = req.body;
    if (!aiEmployeeId) return res.status(400).json({ error: "aiEmployeeId required" });

    const [conv] = await db.insert(conversations).values({
      orgId, userId, aiEmployeeId, title,
    }).returning();

    const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, aiEmployeeId));
    res.status(201).json({ ...conv, aiEmployee: emp });
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/conversations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id));
    const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, conv.aiEmployeeId));
    let role = null;
    if (emp) {
      [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
    }

    res.json({ ...conv, messages: msgs, aiEmployee: emp ? { ...emp, role } : null });
  } catch (error) {
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, conv.aiEmployeeId));
    const [role] = emp ? await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId)) : [null];

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

    res.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send message: " + (error?.message || "unknown") });
  }
});

export default router;
