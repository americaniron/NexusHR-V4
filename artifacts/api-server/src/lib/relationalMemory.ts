import { db } from "@workspace/db";
import { relationalMemories } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

  const [memory] = await db
    .insert(relationalMemories)
    .values({
      orgId,
      userId,
      aiEmployeeId,
      memoryType: entry.memoryType,
      category: entry.category || null,
      content: entry.content,
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
  },
): Promise<Array<typeof relationalMemories.$inferSelect>> {
  const limit = options?.limit ?? 20;

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
