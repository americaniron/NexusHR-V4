import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function ensurePgvector(): Promise<void> {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
    logger.info("pgvector extension enabled");
  } catch (err) {
    logger.error({ err }, "Failed to enable pgvector extension — vector search will not work");
    throw err;
  }
}
