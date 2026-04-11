import { Router } from "express";
import { db } from "@workspace/db";
import { supportTickets, knowledgeBaseArticles, organizations, users } from "@workspace/db";
import { eq, and, sql, ilike, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/support/tickets", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;
    if (!clerkUserId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
    if (!user) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const where = eq(supportTickets.userId, user.id);
    const data = await db.select().from(supportTickets).where(where).orderBy(desc(supportTickets.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(where);

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list tickets" });
  }
});

router.post("/support/tickets", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkOrgId = auth?.orgId;
    const clerkUserId = auth?.userId;

    const [org] = clerkOrgId ? await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)) : [null];
    const [user] = clerkUserId ? await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)) : [null];

    if (!org || !user) return res.status(400).json({ error: "No org or user" });

    const { subject, description, category, priority } = req.body;
    if (!subject || !description) return res.status(400).json({ error: "subject and description required" });

    const [ticket] = await db.insert(supportTickets).values({
      orgId: org.id, userId: user.id, subject, description, category, priority,
    }).returning();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

router.get("/support/articles", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const { category, search } = req.query;

    let conditions: any[] = [eq(knowledgeBaseArticles.isPublished, 1)];
    if (category) conditions.push(eq(knowledgeBaseArticles.category, category as string));
    if (search) conditions.push(ilike(knowledgeBaseArticles.title, `%${search}%`));

    const where = and(...conditions);
    const data = await db.select().from(knowledgeBaseArticles).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(knowledgeBaseArticles).where(where);

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list articles" });
  }
});

export default router;
