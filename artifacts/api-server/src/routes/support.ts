import { Router } from "express";
import { db } from "@workspace/db";
import { supportTickets, knowledgeBaseArticles } from "@workspace/db";
import { eq, and, sql, ilike, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";

const router = Router();

router.get("/support/tickets", requireAuth, async (req, res) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) return res.json(emptyPagination());

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const where = eq(supportTickets.userId, userId);
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
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(400).json({ error: "No org or user" });

    const { subject, description, category, priority } = req.body;
    if (!subject || !description) return res.status(400).json({ error: "subject and description required" });

    const [ticket] = await db.insert(supportTickets).values({
      orgId, userId, subject, description, category, priority,
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
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions = [eq(knowledgeBaseArticles.isPublished, 1)];
    if (category) conditions.push(eq(knowledgeBaseArticles.category, category));
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
