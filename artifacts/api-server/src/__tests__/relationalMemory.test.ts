import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RelationalMemory } from "@workspace/db/schema";
import {
  generateEmbedding,
  cosineSimilarity,
  EMBEDDING_DIMENSIONS,
} from "../lib/embeddingService";

function buildMemory(overrides: Partial<RelationalMemory> & { content: string; memoryType: string }): RelationalMemory {
  return {
    id: 1,
    orgId: 1,
    userId: 1,
    aiEmployeeId: 1,
    category: null,
    embedding: null,
    relevanceScore: 0.5,
    accessCount: 0,
    lastAccessedAt: new Date(),
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } satisfies RelationalMemory;
}

const { selectChain, updateSetChain, executeChain, mockUpdate } = vi.hoisted(() => {
  const selectChain = vi.fn();
  const updateSetChain = vi.fn();
  const executeChain = vi.fn();
  const mockUpdate = vi.fn();
  return { selectChain, updateSetChain, executeChain, mockUpdate };
});

vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: selectChain,
          })),
          limit: vi.fn(() => []),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: 1 }]),
      })),
    })),
    update: mockUpdate.mockImplementation(() => ({
      set: vi.fn(() => ({
        where: updateSetChain,
      })),
    })),
    delete: vi.fn(() => ({ where: vi.fn() })),
    execute: executeChain,
  },
}));

vi.mock("@workspace/db/schema", async () => {
  const { pgTable, text, serial, integer, timestamp, real, customType } = await import("drizzle-orm/pg-core");

  const vector = customType<{ data: number[]; driverParam: string }>({
    dataType() { return "vector(384)"; },
    toDriver(value: number[]): string { return `[${value.join(",")}]`; },
    fromDriver(value: string): number[] {
      const str = typeof value === "string" ? value : String(value);
      return str.replace(/[\[\]]/g, "").split(",").map(Number);
    },
  });

  const relationalMemories = pgTable("relational_memories", {
    id: serial("id").primaryKey(),
    orgId: integer("org_id").notNull(),
    userId: integer("user_id").notNull(),
    aiEmployeeId: integer("ai_employee_id").notNull(),
    memoryType: text("memory_type").notNull(),
    category: text("category"),
    content: text("content").notNull(),
    embedding: vector("embedding"),
    relevanceScore: real("relevance_score").default(0.5).notNull(),
    accessCount: integer("access_count").default(0).notNull(),
    lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });

  return { relationalMemories, messages: {}, conversations: {} };
});

import { formatMemoriesForPrompt, retrieveMemories } from "../lib/relationalMemory";

function flattenToStrings(obj: unknown, seen = new WeakSet()): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj === "string") return [obj];
  if (typeof obj === "number") return [String(obj)];
  if (typeof obj !== "object") return [];
  if (seen.has(obj as object)) return [];
  seen.add(obj as object);
  const results: string[] = [];
  if (Array.isArray(obj)) {
    for (const item of obj) results.push(...flattenToStrings(item, seen));
  } else {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      results.push(...flattenToStrings(val, seen));
    }
  }
  return results;
}

function flattenToValues(obj: unknown, seen = new WeakSet()): unknown[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj === "string" || typeof obj === "number") return [obj];
  if (typeof obj !== "object") return [];
  if (seen.has(obj as object)) return [];
  seen.add(obj as object);
  const results: unknown[] = [];
  if (Array.isArray(obj)) {
    for (const item of obj) results.push(...flattenToValues(item, seen));
  } else {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      results.push(...flattenToValues(val, seen));
    }
  }
  return results;
}

describe("relationalMemory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatMemoriesForPrompt", () => {
    it("returns empty string for no memories", () => {
      expect(formatMemoriesForPrompt([])).toBe("");
    });

    it("formats preference memories correctly", () => {
      const memories = [
        buildMemory({ memoryType: "preference", content: "Prefers dark mode" }),
      ];
      const result = formatMemoriesForPrompt(memories);
      expect(result).toContain("## Relational Memory");
      expect(result).toContain("User preferences:");
      expect(result).toContain("- Prefers dark mode");
    });

    it("formats personal context memories correctly", () => {
      const memories = [
        buildMemory({ id: 2, memoryType: "personal_context", content: "Works on platform team" }),
      ];
      const result = formatMemoriesForPrompt(memories);
      expect(result).toContain("Personal context");
      expect(result).toContain("- Works on platform team");
    });

    it("formats interaction pattern memories correctly", () => {
      const memories = [
        buildMemory({ id: 3, memoryType: "interaction_pattern", content: "User writes concise messages" }),
      ];
      const result = formatMemoriesForPrompt(memories);
      expect(result).toContain("Interaction patterns");
      expect(result).toContain("- User writes concise messages");
    });

    it("groups multiple memory types into sections", () => {
      const memories = [
        buildMemory({ id: 1, memoryType: "preference", content: "Prefers email" }),
        buildMemory({ id: 2, memoryType: "personal_context", content: "Engineering manager" }),
        buildMemory({ id: 3, memoryType: "interaction_pattern", content: "Detailed writer" }),
      ];
      const result = formatMemoriesForPrompt(memories);
      expect(result).toContain("User preferences:");
      expect(result).toContain("Personal context");
      expect(result).toContain("Interaction patterns");
    });

    it("skips sections for memory types with no entries", () => {
      const memories = [
        buildMemory({ memoryType: "preference", content: "Likes bullet points" }),
      ];
      const result = formatMemoriesForPrompt(memories);
      expect(result).toContain("User preferences:");
      expect(result).not.toContain("Personal context");
      expect(result).not.toContain("Interaction patterns");
    });
  });

  describe("retrieveMemories", () => {
    it("returns memories ordered by relevance when no queryText is provided", async () => {
      const expectedMemories = [
        buildMemory({ id: 1, content: "first", memoryType: "preference", relevanceScore: 0.9 }),
        buildMemory({ id: 2, content: "second", memoryType: "preference", relevanceScore: 0.5 }),
      ];
      selectChain.mockResolvedValueOnce(expectedMemories);
      updateSetChain.mockResolvedValueOnce(undefined);

      const result = await retrieveMemories(1, 1, { limit: 10 });
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("first");
      expect(result[1].content).toBe("second");
    });

    it("respects the limit option", async () => {
      const singleMemory = [buildMemory({ id: 1, content: "only one", memoryType: "preference" })];
      selectChain.mockResolvedValueOnce(singleMemory);
      updateSetChain.mockResolvedValueOnce(undefined);

      const result = await retrieveMemories(1, 1, { limit: 1 });
      expect(result).toHaveLength(1);
    });

    it("returns empty array when no memories exist", async () => {
      selectChain.mockResolvedValueOnce([]);
      const result = await retrieveMemories(1, 1);
      expect(result).toEqual([]);
    });

    it("delegates to hybrid search when queryText is provided", async () => {
      const hybridResults = [
        buildMemory({ id: 10, content: "vacation policy details", memoryType: "preference", relevanceScore: 0.8 }),
      ];
      executeChain.mockResolvedValueOnce({ rows: hybridResults });
      updateSetChain.mockResolvedValueOnce(undefined);

      const result = await retrieveMemories(1, 1, {
        queryText: "time off",
        vectorWeight: 0.6,
      });

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("vacation policy details");
      expect(executeChain).toHaveBeenCalled();
    });

    it("filters by memoryType when provided without queryText", async () => {
      const prefMemories = [
        buildMemory({ id: 1, memoryType: "preference", content: "dark mode" }),
      ];
      selectChain.mockResolvedValueOnce(prefMemories);
      updateSetChain.mockResolvedValueOnce(undefined);

      const result = await retrieveMemories(1, 1, { memoryType: "preference" });
      expect(result).toHaveLength(1);
      expect(result[0].memoryType).toBe("preference");
    });

    it("hybrid SQL includes vector similarity and time-decay terms with provided weights", async () => {
      executeChain.mockResolvedValueOnce({ rows: [] });
      await retrieveMemories(1, 1, {
        queryText: "test query",
        vectorWeight: 0.8,
      });
      expect(executeChain).toHaveBeenCalledTimes(1);

      const sqlObj = executeChain.mock.calls[0][0];
      const chunks = sqlObj.queryChunks ?? [];
      const stringParts = flattenToStrings(chunks);
      const joined = stringParts.join(" ");
      expect(joined).toContain("<=>");
      expect(joined).toContain("hybrid_score");
      expect(joined).toContain("EXTRACT(EPOCH");
      expect(joined).toContain("ORDER BY hybrid_score DESC");
    });

    it("derives timeDecayWeight as complement of vectorWeight", async () => {
      executeChain.mockResolvedValueOnce({ rows: [] });
      await retrieveMemories(1, 1, {
        queryText: "test",
        vectorWeight: 0.7,
      });

      const sqlObj = executeChain.mock.calls[0][0];
      const chunks = sqlObj.queryChunks ?? [];
      const allValues = flattenToValues(chunks);
      const numericValues = allValues.filter((v): v is number => typeof v === "number");
      expect(numericValues).toContain(0.7);
      const hasComplement = numericValues.some(v => Math.abs(v - 0.3) < 0.001);
      expect(hasComplement).toBe(true);
    });

    it("uses default limit of 20 when not specified", async () => {
      selectChain.mockResolvedValueOnce([]);
      await retrieveMemories(1, 1);
      expect(selectChain).toHaveBeenCalled();
    });

    it("updates lastAccessedAt for returned memories", async () => {
      const memories = [
        buildMemory({ id: 5, content: "test memory", memoryType: "preference" }),
      ];
      selectChain.mockResolvedValueOnce(memories);
      updateSetChain.mockResolvedValueOnce(undefined);

      await retrieveMemories(1, 1);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
