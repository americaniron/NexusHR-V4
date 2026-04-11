import { Router } from "express";
import { db } from "@workspace/db";
import { supportTickets, knowledgeBaseArticles } from "@workspace/db";
import { eq, and, sql, ilike, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery } from "../middlewares/validate";

const router = Router();

const createTicketBody = z.object({
  subject: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

const listArticlesQuery = paginationQuery.extend({
  category: z.string().optional(),
  search: z.string().optional(),
});

router.get("/support/tickets", requireAuth, validate({ query: paginationQuery }), async (req, res) => {
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
    res.status(500).json({ error: "Failed to list tickets", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/support/tickets", requireAuth, validate({ body: createTicketBody }), async (req, res) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(400).json({ error: "No org or user", code: "BAD_REQUEST", statusCode: 400 });

    const { subject, description, category, priority } = req.body;

    const [ticket] = await db.insert(supportTickets).values({
      orgId, userId, subject, description, category, priority,
    }).returning();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to create ticket", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.get("/support/articles", validate({ query: listArticlesQuery }), async (req, res) => {
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
    res.status(500).json({ error: "Failed to list articles", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

export default router;
