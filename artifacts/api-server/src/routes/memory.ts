import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { retrieveMemories, deleteMemory, backfillEmbeddings } from "../lib/relationalMemory";
import { consolidateRecentConversations } from "../lib/memoryConsolidation";
import { db } from "@workspace/db";
import { relationalMemories } from "@workspace/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";

const router = Router();

router.get("/memory/list/:aiEmployeeId", requireAuth, async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) throw AppError.forbidden();

    const aiEmployeeId = parseInt(req.params.aiEmployeeId, 10);
    if (!aiEmployeeId || isNaN(aiEmployeeId)) throw AppError.badRequest("Invalid aiEmployeeId");

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
    const memoryType = req.query.type as string | undefined;

    const conditions = [
      eq(relationalMemories.userId, userId),
      eq(relationalMemories.aiEmployeeId, aiEmployeeId),
    ];
    if (memoryType && ["preference", "personal_context", "interaction_pattern"].includes(memoryType)) {
      conditions.push(eq(relationalMemories.memoryType, memoryType));
    }

    const whereClause = and(...conditions);

    const [memories, [totalResult]] = await Promise.all([
      db
        .select({
          id: relationalMemories.id,
          memoryType: relationalMemories.memoryType,
          category: relationalMemories.category,
          content: relationalMemories.content,
          relevanceScore: relationalMemories.relevanceScore,
          accessCount: relationalMemories.accessCount,
          lastAccessedAt: relationalMemories.lastAccessedAt,
          createdAt: relationalMemories.createdAt,
          updatedAt: relationalMemories.updatedAt,
        })
        .from(relationalMemories)
        .where(whereClause)
        .orderBy(desc(relationalMemories.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(relationalMemories)
        .where(whereClause),
    ]);

    res.json({
      data: memories,
      total: totalResult?.value ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/memory/:id", requireAuth, async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) throw AppError.forbidden();

    const memoryId = parseInt(req.params.id, 10);
    if (!memoryId || isNaN(memoryId)) throw AppError.badRequest("Invalid memory id");

    const [existing] = await db
      .select({ id: relationalMemories.id, userId: relationalMemories.userId })
      .from(relationalMemories)
      .where(eq(relationalMemories.id, memoryId))
      .limit(1);

    if (!existing) throw AppError.notFound("Memory not found");
    if (existing.userId !== userId) throw AppError.forbidden("You can only delete your own memories");

    await deleteMemory(memoryId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const semanticSearchBody = z.object({
  aiEmployeeId: z.number().int().min(1),
  query: z.string().min(1).max(2000),
  limit: z.number().int().min(1).max(50).optional(),
});

router.post("/memory/search", requireAuth, validate({ body: semanticSearchBody }), async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) throw AppError.forbidden();

    const { aiEmployeeId, query, limit } = req.body;

    const memories = await retrieveMemories(userId, aiEmployeeId, {
      limit: limit || 10,
      queryText: query,
      vectorWeight: 0.6,
    });

    res.json({
      data: memories.map(m => ({
        id: m.id,
        memoryType: m.memoryType,
        category: m.category,
        content: m.content,
        relevanceScore: m.relevanceScore,
        createdAt: m.createdAt,
      })),
      query,
      count: memories.length,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/memory/backfill", requireAuth, async (req, res, next) => {
  try {
    const { orgId, isOwner } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();
    if (!isOwner) {
      throw AppError.forbidden("Only organization owners can trigger backfill");
    }

    const batchSize = Math.min(500, Math.max(1, parseInt(req.body?.batchSize) || 100));
    const result = await backfillEmbeddings(batchSize, orgId);

    res.json({
      message: "Embedding backfill complete",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/memory/consolidate", requireAuth, async (req, res, next) => {
  try {
    const { orgId, isOwner } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();
    if (!isOwner) {
      throw AppError.forbidden("Only organization owners can trigger consolidation");
    }

    const sinceMinutes = Math.min(1440, Math.max(5, parseInt(req.body?.sinceMinutes) || 60));
    const result = await consolidateRecentConversations(sinceMinutes, orgId);

    res.json({
      message: "Memory consolidation complete",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
