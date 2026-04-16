import { describe, it, expect } from "vitest";
import {
  generateEmbedding,
  cosineSimilarity,
  formatVectorForPg,
  EMBEDDING_DIMENSIONS,
} from "../lib/embeddingService";

describe("embeddingService", () => {
  describe("generateEmbedding", () => {
    it("produces a vector of the correct dimension", () => {
      const vec = generateEmbedding("hello world");
      expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);
      expect(vec).toHaveLength(384);
    });

    it("returns a zero vector for empty text", () => {
      const vec = generateEmbedding("");
      expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);
      expect(vec.every(v => v === 0)).toBe(true);
    });

    it("returns a zero vector for text with only stopwords", () => {
      const vec = generateEmbedding("the a an is are");
      expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);
      expect(vec.every(v => v === 0)).toBe(true);
    });

    it("produces a normalized vector (unit length)", () => {
      const vec = generateEmbedding("employee performance review");
      const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("is deterministic — same input produces the same output", () => {
      const a = generateEmbedding("quarterly sales report");
      const b = generateEmbedding("quarterly sales report");
      expect(a).toEqual(b);
    });

    it("produces different vectors for different inputs", () => {
      const a = generateEmbedding("machine learning algorithms");
      const b = generateEmbedding("cooking recipe for pasta");
      expect(a).not.toEqual(b);
    });

    it("handles single-character tokens by filtering them out", () => {
      const vec = generateEmbedding("a b c d e f");
      expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);
      expect(vec.every(v => v === 0)).toBe(true);
    });

    it("handles very long text without error", () => {
      const longText = "performance ".repeat(1000);
      const vec = generateEmbedding(longText);
      expect(vec).toHaveLength(EMBEDDING_DIMENSIONS);
      const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("strips punctuation before embedding", () => {
      const a = generateEmbedding("hello, world!");
      const b = generateEmbedding("hello world");
      expect(a).toEqual(b);
    });
  });

  describe("cosineSimilarity", () => {
    it("returns 1 for identical normalized vectors", () => {
      const vec = generateEmbedding("team meeting notes");
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0, 5);
    });

    it("returns 0 for orthogonal vectors", () => {
      const a = new Array(EMBEDDING_DIMENSIONS).fill(0);
      const b = new Array(EMBEDDING_DIMENSIONS).fill(0);
      a[0] = 1;
      b[1] = 1;
      expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5);
    });

    it("returns 0 when either vector is all zeros", () => {
      const zero = new Array(EMBEDDING_DIMENSIONS).fill(0);
      const nonZero = generateEmbedding("test");
      expect(cosineSimilarity(zero, nonZero)).toBe(0);
      expect(cosineSimilarity(nonZero, zero)).toBe(0);
    });

    it("returns 0 for mismatched dimensions", () => {
      const a = [1, 0, 0];
      const b = [1, 0];
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it("returns -1 for opposite vectors", () => {
      const a = new Array(EMBEDDING_DIMENSIONS).fill(0);
      const b = new Array(EMBEDDING_DIMENSIONS).fill(0);
      a[0] = 1;
      b[0] = -1;
      expect(cosineSimilarity(a, b)).toBeCloseTo(-1.0, 5);
    });

    it("ranks semantically similar texts higher than unrelated ones", () => {
      const query = generateEmbedding("employee salary review");
      const related = generateEmbedding("worker compensation evaluation");
      const unrelated = generateEmbedding("tropical fish aquarium setup");

      const simRelated = cosineSimilarity(query, related);
      const simUnrelated = cosineSimilarity(query, unrelated);

      expect(simRelated).toBeGreaterThan(simUnrelated);
    });

    it("is symmetric", () => {
      const a = generateEmbedding("project deadline");
      const b = generateEmbedding("task timeline");
      expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10);
    });
  });

  describe("formatVectorForPg", () => {
    it("formats a vector as a pgvector-compatible string", () => {
      const vec = [0.1, 0.2, -0.3];
      expect(formatVectorForPg(vec)).toBe("[0.1,0.2,-0.3]");
    });

    it("formats an empty vector", () => {
      expect(formatVectorForPg([])).toBe("[]");
    });

    it("formats a full-dimension embedding", () => {
      const vec = generateEmbedding("test");
      const formatted = formatVectorForPg(vec);
      expect(formatted.startsWith("[")).toBe(true);
      expect(formatted.endsWith("]")).toBe(true);
      const parts = formatted.slice(1, -1).split(",");
      expect(parts).toHaveLength(EMBEDDING_DIMENSIONS);
    });
  });

  describe("similarity ordering", () => {
    it("orders a set of texts by relevance to a query", () => {
      const query = generateEmbedding("hiring new engineer");

      const candidates = [
        { text: "hiring new engineer for the team", label: "close" },
        { text: "onboarding new team member process", label: "related" },
        { text: "office kitchen coffee machine repair", label: "unrelated" },
      ];

      const scored = candidates.map(c => ({
        ...c,
        score: cosineSimilarity(query, generateEmbedding(c.text)),
      }));

      scored.sort((a, b) => b.score - a.score);

      expect(scored[0].label).toBe("close");
      expect(scored[scored.length - 1].label).toBe("unrelated");
    });

    it("identical text scores higher than merely similar text", () => {
      const text = "employee performance review";
      const query = generateEmbedding(text);
      const identical = generateEmbedding(text);
      const similar = generateEmbedding("worker evaluation assessment");

      expect(cosineSimilarity(query, identical)).toBeGreaterThan(
        cosineSimilarity(query, similar),
      );
    });
  });
});
