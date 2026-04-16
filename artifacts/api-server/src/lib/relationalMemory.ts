import { db, pool } from "@workspace/db";
import { relationalMemories } from "@workspace/db/schema";
import { eq, and, desc, sql, isNull, gt, asc } from "drizzle-orm";
import { generateEmbedding, formatVectorForPg, EMBEDDING_DIMENSIONS } from "./embeddingService";
import { logger } from "./logger";

export type MemoryType = "preference" | "personal_context" | "interaction_pattern";

export interface MemoryEntry {
  memoryType: MemoryType;
  category?: string;
  content: string;
  relevanceScore?: number;
}

export async function storeMemory(
  orgId: number,
  userId: number,
  aiEmployeeId: number,
  entry: MemoryEntry,
): Promise<typeof relationalMemories.$inferSelect> {
  const existing = await db
    .select()
    .from(relationalMemories)
    .where(
      and(
        eq(relationalMemories.orgId, orgId),
        eq(relationalMemories.userId, userId),
        eq(relationalMemories.aiEmployeeId, aiEmployeeId),
        eq(relationalMemories.memoryType, entry.memoryType),
        eq(relationalMemories.content, entry.content),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(relationalMemories)
      .set({
        relevanceScore: Math.min(1, (existing[0].relevanceScore || 0.5) + 0.1),
        accessCount: (existing[0].accessCount || 0) + 1,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(relationalMemories.id, existing[0].id))
      .returning();
    return updated;
  }

  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(entry.content);
  } catch (err) {
    logger.warn({ err }, "Failed to generate embedding for memory, storing without vector");
  }

  const [memory] = await db
    .insert(relationalMemories)
    .values({
      orgId,
      userId,
      aiEmployeeId,
      memoryType: entry.memoryType,
      category: entry.category || null,
      content: entry.content,
      embedding,
      relevanceScore: entry.relevanceScore ?? 0.5,
    })
    .returning();

  return memory;
}

export async function retrieveMemories(
  userId: number,
  aiEmployeeId: number,
  options?: {
    limit?: number;
    memoryType?: MemoryType;
    queryText?: string;
    vectorWeight?: number;
    timeDecayWeight?: number;
  },
): Promise<Array<typeof relationalMemories.$inferSelect>> {
  const limit = options?.limit ?? 20;
  const vectorWeight = options?.vectorWeight ?? 0.5;
  const timeDecayWeight = 1 - vectorWeight;

  if (options?.queryText) {
    return retrieveMemoriesHybrid(userId, aiEmployeeId, options.queryText, {
      limit,
      memoryType: options.memoryType,
      vectorWeight,
      timeDecayWeight,
    });
  }

  const conditions = [
    eq(relationalMemories.userId, userId),
    eq(relationalMemories.aiEmployeeId, aiEmployeeId),
  ];

  if (options?.memoryType) {
    conditions.push(eq(relationalMemories.memoryType, options.memoryType));
  }

  const memories = await db
    .select()
    .from(relationalMemories)
    .where(and(...conditions))
    .orderBy(
      desc(sql`(${relationalMemories.relevanceScore} * 0.6) + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - ${relationalMemories.lastAccessedAt})) / 86400.0)) * 0.4`),
    )
    .limit(limit);

  if (memories.length > 0) {
    const memoryIds = memories.map(m => m.id);
    await db
      .update(relationalMemories)
      .set({ lastAccessedAt: new Date() })
      .where(sql`${relationalMemories.id} = ANY(${memoryIds})`);
  }

  return memories;
}

async function retrieveMemoriesHybrid(
  userId: number,
  aiEmployeeId: number,
  queryText: string,
  options: {
    limit: number;
    memoryType?: MemoryType;
    vectorWeight: number;
    timeDecayWeight: number;
  },
): Promise<Array<typeof relationalMemories.$inferSelect>> {
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(queryText);
  } catch (err) {
    logger.warn({ err }, "Failed to generate query embedding, falling back to non-vector retrieval");
    return retrieveMemories(userId, aiEmployeeId, {
      limit: options.limit,
      memoryType: options.memoryType,
    });
  }

  const vecStr = formatVectorForPg(queryEmbedding);

  const typeFilter = options.memoryType
    ? sql`AND ${relationalMemories.memoryType} = ${options.memoryType}`
    : sql``;

  const results = await db.execute(sql`
    SELECT *,
      CASE
        WHEN embedding IS NOT NULL THEN
          (1 - (embedding <=> ${vecStr}::vector)) * ${options.vectorWeight}
          + (${relationalMemories.relevanceScore} * 0.3 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - ${relationalMemories.lastAccessedAt})) / 86400.0)) * 0.2) * ${options.timeDecayWeight}
        ELSE
          (${relationalMemories.relevanceScore} * 0.6 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - ${relationalMemories.lastAccessedAt})) / 86400.0)) * 0.4) * ${options.timeDecayWeight}
      END as hybrid_score
    FROM relational_memories
    WHERE ${relationalMemories.userId} = ${userId}
      AND ${relationalMemories.aiEmployeeId} = ${aiEmployeeId}
      ${typeFilter}
    ORDER BY hybrid_score DESC
    LIMIT ${options.limit}
  `);

  const memories = (results.rows || []) as Array<typeof relationalMemories.$inferSelect>;

  if (memories.length > 0) {
    const memoryIds = memories.map(m => m.id);
    await db
      .update(relationalMemories)
      .set({ lastAccessedAt: new Date() })
      .where(sql`${relationalMemories.id} = ANY(${memoryIds})`);
  }

  return memories;
}

export function formatMemoriesForPrompt(
  memories: Array<typeof relationalMemories.$inferSelect>,
): string {
  if (memories.length === 0) return "";

  const grouped: Record<string, string[]> = {
    preference: [],
    personal_context: [],
    interaction_pattern: [],
  };

  for (const m of memories) {
    const key = m.memoryType as string;
    if (grouped[key]) {
      grouped[key].push(m.content);
    }
  }

  const sections: string[] = [];

  if (grouped.preference.length > 0) {
    sections.push(`User preferences:\n${grouped.preference.map(p => `- ${p}`).join("\n")}`);
  }

  if (grouped.personal_context.length > 0) {
    sections.push(`Personal context you know about this user:\n${grouped.personal_context.map(p => `- ${p}`).join("\n")}`);
  }

  if (grouped.interaction_pattern.length > 0) {
    sections.push(`Interaction patterns:\n${grouped.interaction_pattern.map(p => `- ${p}`).join("\n")}`);
  }

  if (sections.length === 0) return "";

  return `## Relational Memory\nYou remember the following about this user from previous interactions:\n\n${sections.join("\n\n")}`;
}

export async function deleteMemory(memoryId: number): Promise<void> {
  await db.delete(relationalMemories).where(eq(relationalMemories.id, memoryId));
}

export async function deleteUserMemories(userId: number, aiEmployeeId: number): Promise<void> {
  await db.delete(relationalMemories).where(
    and(
      eq(relationalMemories.userId, userId),
      eq(relationalMemories.aiEmployeeId, aiEmployeeId),
    ),
  );
}

export async function backfillEmbeddings(batchSize: number = 100, orgId?: number, reembedAll: boolean = false): Promise<{ processed: number; errors: number }> {
  let totalProcessed = 0;
  let totalErrors = 0;
  let cursor = 0;

  while (true) {
    const conditions: ReturnType<typeof eq>[] = [];
    if (!reembedAll) {
      conditions.push(isNull(relationalMemories.embedding));
    }
    if (orgId) {
      conditions.push(eq(relationalMemories.orgId, orgId));
    }
    conditions.push(gt(relationalMemories.id, cursor));

    const records = await db
      .select({ id: relationalMemories.id, content: relationalMemories.content })
      .from(relationalMemories)
      .where(and(...conditions))
      .orderBy(asc(relationalMemories.id))
      .limit(batchSize);

    if (records.length === 0) break;

    for (const memory of records) {
      try {
        const embedding = await generateEmbedding(memory.content);
        await db
          .update(relationalMemories)
          .set({ embedding })
          .where(eq(relationalMemories.id, memory.id));
        totalProcessed++;
      } catch (err) {
        logger.warn({ err, memoryId: memory.id }, "Failed to backfill embedding");
        totalErrors++;
      }
    }

    cursor = records[records.length - 1].id;
    logger.info({ batch: records.length, totalProcessed, totalErrors, cursor, reembedAll }, "Embedding backfill batch progress");

    if (records.length < batchSize) break;
  }

  logger.info({ processed: totalProcessed, errors: totalErrors, reembedAll }, "Embedding backfill complete");

  if (reembedAll && totalProcessed > 0) {
    await rebuildEmbeddingIndex();
  }

  return { processed: totalProcessed, errors: totalErrors };
}

export async function rebuildEmbeddingIndex(): Promise<void> {
  try {
    await pool.query(`DROP INDEX IF EXISTS idx_relational_memories_embedding`);
    await pool.query(`
      CREATE INDEX idx_relational_memories_embedding
      ON relational_memories
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);
    logger.info("Rebuilt ivfflat embedding index after backfill");
  } catch (err) {
    logger.warn({ err }, "Failed to rebuild embedding index (non-critical, queries still work)");
  }
}
