import { Router } from "express";
import { randomBytes, createHash } from "crypto";
import { db, apiKeys } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuthContext } from "../lib/auth-helpers";
import { requireAuth } from "../middlewares/requireAuth";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../lib/logger";

const router = Router();

function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const fullKey = `nxhr_sk_${raw}`;
  const prefix = `nxhr_sk_${raw.slice(0, 8)}`;
  const hash = createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, prefix, hash };
}

router.get("/api-keys", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.notFound("No organization");

    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      revoked: apiKeys.revoked,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
      .from(apiKeys)
      .where(eq(apiKeys.orgId, orgId))
      .orderBy(desc(apiKeys.createdAt));

    res.json({ data: keys });
  } catch (error) {
    next(error);
  }
});

router.post("/api-keys", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.notFound("No organization");

    const name = req.body?.name || "Production API Key";
    const { fullKey, prefix, hash } = generateApiKey();

    const [key] = await db.insert(apiKeys).values({
      orgId,
      name,
      keyPrefix: prefix,
      keyHash: hash,
    }).returning();

    logger.info({ orgId, keyId: key.id }, "API key created");

    res.status(201).json({
      id: key.id,
      name: key.name,
      key: fullKey,
      keyPrefix: prefix,
      createdAt: key.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/api-keys/:id", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.notFound("No organization");

    const keyId = parseInt(req.params.id);
    if (isNaN(keyId)) throw AppError.badRequest("Invalid key ID");

    const [key] = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.orgId, orgId)));

    if (!key) throw AppError.notFound("API key not found");

    await db.update(apiKeys)
      .set({ revoked: true })
      .where(eq(apiKeys.id, keyId));

    logger.info({ orgId, keyId }, "API key revoked");
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
