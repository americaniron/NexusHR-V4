import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool } from "@workspace/db";
import {
  generateEmbedding,
  cosineSimilarity,
  formatVectorForPg,
  EMBEDDING_DIMENSIONS,
} from "../lib/embeddingService";

const TEST_TABLE = "_test_vector_search";

beforeAll(async () => {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(`DROP TABLE IF EXISTS ${TEST_TABLE}`);
  await pool.query(`
    CREATE TABLE ${TEST_TABLE} (
      id serial PRIMARY KEY,
      label text NOT NULL,
      content text NOT NULL,
      embedding vector(${EMBEDDING_DIMENSIONS}),
      relevance_score real NOT NULL DEFAULT 0.5,
      last_accessed_at timestamptz NOT NULL DEFAULT now()
    )
  `);
});

afterAll(async () => {
  await pool.query(`DROP TABLE IF EXISTS ${TEST_TABLE}`);
});

async function insertTestRow(label: string, content: string, relevanceScore = 0.5, lastAccessedAt?: Date) {
  const embedding = generateEmbedding(content);
  const vecStr = formatVectorForPg(embedding);
  const accessed = lastAccessedAt ?? new Date();
  const result = await pool.query(
    `INSERT INTO ${TEST_TABLE} (label, content, embedding, relevance_score, last_accessed_at)
     VALUES ($1, $2, $3::vector, $4, $5) RETURNING id`,
    [label, content, vecStr, relevanceScore, accessed],
  );
  return result.rows[0].id as number;
}

describe("pgvector integration", () => {
  describe("cosine distance operator (<=>)", () => {
    beforeAll(async () => {
      await pool.query(`DELETE FROM ${TEST_TABLE}`);
      await insertTestRow("payroll", "employee payroll processing system");
      await insertTestRow("salary", "salary calculation and compensation");
      await insertTestRow("fish", "tropical fish aquarium maintenance guide");
    });

    it("stores and retrieves vector embeddings correctly", async () => {
      const result = await pool.query(
        `SELECT label, embedding FROM ${TEST_TABLE} WHERE label = 'payroll'`,
      );
      expect(result.rows).toHaveLength(1);

      const storedVec = result.rows[0].embedding
        .replace(/[\[\]]/g, "")
        .split(",")
        .map(Number);
      expect(storedVec).toHaveLength(EMBEDDING_DIMENSIONS);

      const expectedVec = generateEmbedding("employee payroll processing system");
      for (let i = 0; i < storedVec.length; i++) {
        expect(storedVec[i]).toBeCloseTo(expectedVec[i], 4);
      }
    });

    it("orders results by cosine distance (closest first)", async () => {
      const queryVec = formatVectorForPg(generateEmbedding("payroll salary compensation"));

      const result = await pool.query(
        `SELECT label, embedding <=> $1::vector AS distance
         FROM ${TEST_TABLE}
         ORDER BY distance ASC`,
        [queryVec],
      );

      expect(result.rows.length).toBe(3);
      const labels = result.rows.map((r: { label: string }) => r.label);
      expect(labels[labels.length - 1]).toBe("fish");
    });

    it("cosine distance from pgvector matches local cosineSimilarity", async () => {
      const queryEmb = generateEmbedding("payroll salary compensation");
      const queryVec = formatVectorForPg(queryEmb);

      const result = await pool.query(
        `SELECT label, content, embedding <=> $1::vector AS distance
         FROM ${TEST_TABLE}
         ORDER BY distance ASC`,
        [queryVec],
      );

      for (const row of result.rows) {
        const storedEmb = generateEmbedding(row.content);
        const localSim = cosineSimilarity(queryEmb, storedEmb);
        const localDist = 1 - localSim;
        expect(row.distance).toBeCloseTo(localDist, 3);
      }
    });

    it("self-distance is zero", async () => {
      const payrollEmb = generateEmbedding("employee payroll processing system");
      const vecStr = formatVectorForPg(payrollEmb);

      const result = await pool.query(
        `SELECT embedding <=> $1::vector AS distance
         FROM ${TEST_TABLE}
         WHERE label = 'payroll'`,
        [vecStr],
      );

      expect(result.rows[0].distance).toBeCloseTo(0, 5);
    });
  });

  describe("hybrid scoring query", () => {
    beforeAll(async () => {
      await pool.query(`DELETE FROM ${TEST_TABLE}`);

      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 86400 * 1000);

      await insertTestRow("recent-relevant", "employee onboarding process for new hires", 0.9, now);
      await insertTestRow("old-relevant", "employee onboarding checklist template", 0.5, oneMonthAgo);
      await insertTestRow("recent-unrelated", "tropical fish care and feeding guide", 0.9, now);
      await insertTestRow("old-unrelated", "underwater basket weaving instructions", 0.5, oneMonthAgo);
    });

    it("hybrid score combines vector similarity and time decay", async () => {
      const queryVec = formatVectorForPg(generateEmbedding("new employee onboarding"));
      const vectorWeight = 0.5;
      const timeDecayWeight = 0.5;

      const result = await pool.query(
        `SELECT label,
           CASE
             WHEN embedding IS NOT NULL THEN
               (1 - (embedding <=> $1::vector)) * $2
               + (relevance_score * 0.3 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - last_accessed_at)) / 86400.0)) * 0.2) * $3
             ELSE
               (relevance_score * 0.6 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - last_accessed_at)) / 86400.0)) * 0.4) * $3
           END as hybrid_score
         FROM ${TEST_TABLE}
         ORDER BY hybrid_score DESC`,
        [queryVec, vectorWeight, timeDecayWeight],
      );

      expect(result.rows.length).toBe(4);
      const labels = result.rows.map((r: { label: string }) => r.label);
      expect(labels[0]).toBe("recent-relevant");
      expect(labels[labels.length - 1]).toBe("old-unrelated");
    });

    it("higher vectorWeight makes vector similarity dominate ordering", async () => {
      const queryVec = formatVectorForPg(generateEmbedding("new employee onboarding"));
      const vectorWeight = 0.9;
      const timeDecayWeight = 0.1;

      const result = await pool.query(
        `SELECT label,
           (1 - (embedding <=> $1::vector)) * $2
           + (relevance_score * 0.3 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - last_accessed_at)) / 86400.0)) * 0.2) * $3
           as hybrid_score
         FROM ${TEST_TABLE}
         WHERE embedding IS NOT NULL
         ORDER BY hybrid_score DESC`,
        [queryVec, vectorWeight, timeDecayWeight],
      );

      const topTwo = result.rows.slice(0, 2).map((r: { label: string }) => r.label);
      expect(topTwo).toContain("recent-relevant");
      expect(topTwo).toContain("old-relevant");
    });

    it("LIMIT restricts the number of returned rows", async () => {
      const queryVec = formatVectorForPg(generateEmbedding("onboarding"));

      const result = await pool.query(
        `SELECT label, embedding <=> $1::vector AS distance
         FROM ${TEST_TABLE}
         ORDER BY distance ASC
         LIMIT 2`,
        [queryVec],
      );

      expect(result.rows.length).toBe(2);
    });

    it("handles NULL embedding gracefully in hybrid scoring", async () => {
      await pool.query(
        `INSERT INTO ${TEST_TABLE} (label, content, embedding, relevance_score)
         VALUES ('no-vector', 'record without embedding', NULL, 0.7)`,
      );

      const queryVec = formatVectorForPg(generateEmbedding("test"));

      const result = await pool.query(
        `SELECT label,
           CASE
             WHEN embedding IS NOT NULL THEN
               (1 - (embedding <=> $1::vector)) * 0.5
               + (relevance_score * 0.3 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - last_accessed_at)) / 86400.0)) * 0.2) * 0.5
             ELSE
               (relevance_score * 0.6 + (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - last_accessed_at)) / 86400.0)) * 0.4) * 0.5
           END as hybrid_score
         FROM ${TEST_TABLE}
         ORDER BY hybrid_score DESC`,
        [queryVec],
      );

      const nullRow = result.rows.find((r: { label: string }) => r.label === "no-vector");
      expect(nullRow).toBeDefined();
      expect(nullRow.hybrid_score).toBeGreaterThan(0);
    });
  });
});
