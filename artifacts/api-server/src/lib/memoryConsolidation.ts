import { db } from "@workspace/db";
import { messages, conversations, relationalMemories } from "@workspace/db/schema";
import { eq, and, desc, sql, gt } from "drizzle-orm";
import { storeMemory } from "./relationalMemory";
import { logger } from "./logger";

interface ConversationSummary {
  conversationId: number;
  orgId: number;
  userId: number;
  aiEmployeeId: number;
  recentMessages: Array<{ role: string; content: string; createdAt: Date }>;
}

async function getRecentConversations(sinceMinutes: number = 60, limit: number = 50, orgId?: number): Promise<ConversationSummary[]> {
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

  const conditions = [gt(conversations.lastMessageAt, since)];
  if (orgId) {
    conditions.push(eq(conversations.orgId, orgId));
  }

  const recentConvs = await db
    .select({
      id: conversations.id,
      orgId: conversations.orgId,
      userId: conversations.userId,
      aiEmployeeId: conversations.aiEmployeeId,
    })
    .from(conversations)
    .where(and(...conditions))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit);

  const summaries: ConversationSummary[] = [];

  for (const conv of recentConvs) {
    const msgs = await db
      .select({
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conv.id),
          gt(messages.createdAt, since),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(20);

    if (msgs.length >= 2) {
      summaries.push({
        conversationId: conv.id,
        orgId: conv.orgId,
        userId: conv.userId,
        aiEmployeeId: conv.aiEmployeeId,
        recentMessages: msgs.reverse(),
      });
    }
  }

  return summaries;
}

function extractMemoryEntries(msgs: Array<{ role: string; content: string }>): Array<{
  memoryType: "preference" | "personal_context" | "interaction_pattern";
  content: string;
}> {
  const entries: Array<{
    memoryType: "preference" | "personal_context" | "interaction_pattern";
    content: string;
  }> = [];

  const preferencePatterns = [
    /i (?:prefer|like|want|need|always|usually|love)\s+(.+)/i,
    /(?:please|can you)\s+(?:always|never|make sure)\s+(.+)/i,
    /my (?:preferred|favorite|default)\s+(.+)/i,
  ];

  const contextPatterns = [
    /(?:i am|i'm|i work|my (?:name|role|team|department|job|title) is)\s+(.+)/i,
    /(?:i have|i've been|i started|i joined)\s+(.+)/i,
    /(?:my (?:team|project|client|manager|boss))\s+(.+)/i,
  ];

  for (const msg of msgs) {
    if (msg.role !== "user") continue;
    const content = msg.content.trim();
    if (content.length < 10 || content.length > 500) continue;

    for (const pattern of preferencePatterns) {
      if (pattern.test(content)) {
        entries.push({
          memoryType: "preference",
          content: content.slice(0, 300),
        });
        break;
      }
    }

    for (const pattern of contextPatterns) {
      if (pattern.test(content)) {
        entries.push({
          memoryType: "personal_context",
          content: content.slice(0, 300),
        });
        break;
      }
    }
  }

  if (msgs.length >= 4) {
    const userMsgs = msgs.filter(m => m.role === "user");
    if (userMsgs.length >= 2) {
      const avgLength = userMsgs.reduce((sum, m) => sum + m.content.length, 0) / userMsgs.length;
      const style = avgLength < 50 ? "concise" : avgLength > 200 ? "detailed" : "moderate";
      entries.push({
        memoryType: "interaction_pattern",
        content: `User tends to write ${style} messages (avg ${Math.round(avgLength)} chars)`,
      });
    }
  }

  return entries;
}

export async function consolidateRecentConversations(sinceMinutes: number = 60, orgId?: number): Promise<{
  conversationsProcessed: number;
  memoriesCreated: number;
  errors: number;
}> {
  let conversationsProcessed = 0;
  let memoriesCreated = 0;
  let errors = 0;

  try {
    const summaries = await getRecentConversations(sinceMinutes, 50, orgId);

    for (const summary of summaries) {
      try {
        const entries = extractMemoryEntries(summary.recentMessages);

        for (const entry of entries) {
          try {
            await storeMemory(
              summary.orgId,
              summary.userId,
              summary.aiEmployeeId,
              entry,
            );
            memoriesCreated++;
          } catch (err) {
            logger.warn({ err, conversationId: summary.conversationId }, "Failed to store memory entry");
            errors++;
          }
        }

        conversationsProcessed++;
      } catch (err) {
        logger.warn({ err, conversationId: summary.conversationId }, "Failed to process conversation for memory consolidation");
        errors++;
      }
    }
  } catch (err) {
    logger.error({ err }, "Memory consolidation failed");
    errors++;
  }

  logger.info(
    { conversationsProcessed, memoriesCreated, errors },
    "Memory consolidation cycle complete",
  );

  return { conversationsProcessed, memoriesCreated, errors };
}

let consolidationTimer: ReturnType<typeof setInterval> | null = null;

export function startMemoryConsolidation(intervalMinutes: number = 30): void {
  if (consolidationTimer) {
    logger.warn("Memory consolidation is already running");
    return;
  }

  logger.info({ intervalMinutes }, "Starting memory consolidation background job");

  consolidationTimer = setInterval(async () => {
    try {
      await consolidateRecentConversations(intervalMinutes + 5);
    } catch (err) {
      logger.error({ err }, "Memory consolidation interval error");
    }
  }, intervalMinutes * 60 * 1000);

  setTimeout(async () => {
    try {
      const { backfillEmbeddings } = await import("./relationalMemory");
      let totalProcessed = 0;
      let batch: { processed: number; errors: number };
      do {
        batch = await backfillEmbeddings(200);
        totalProcessed += batch.processed;
      } while (batch.processed > 0);
      if (totalProcessed > 0) {
        logger.info({ totalProcessed }, "Completed full embedding backfill on startup");
      }
    } catch (err) {
      logger.warn({ err }, "Initial embedding backfill failed");
    }
  }, 10_000);
}

export function stopMemoryConsolidation(): void {
  if (consolidationTimer) {
    clearInterval(consolidationTimer);
    consolidationTimer = null;
    logger.info("Memory consolidation stopped");
  }
}
