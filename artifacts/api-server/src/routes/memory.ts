import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { retrieveMemories, backfillEmbeddings } from "../lib/relationalMemory";
import { consolidateRecentConversations } from "../lib/memoryConsolidation";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";

const router = Router();

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
