import { Router } from "express";
import { db } from "@workspace/db";
import { toolRegistry, integrations } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";

const router = Router();

const toolIdParam = z.object({
  toolId: z.coerce.number().int().min(1),
});

router.get("/integrations", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    const tools = await db.select().from(toolRegistry).where(eq(toolRegistry.isActive, 1));

    const data = await Promise.all(tools.map(async (tool) => {
      let isConnected = false;
      let connectedAt = null;
      if (orgId) {
        const [integration] = await db.select().from(integrations)
          .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, tool.id)));
        if (integration && integration.status === "connected") {
          isConnected = true;
          connectedAt = integration.connectedAt;
        }
      }
      return {
        id: tool.id,
        name: tool.name,
        displayName: tool.displayName,
        category: tool.category,
        description: tool.description,
        iconUrl: tool.iconUrl,
        isConnected,
        connectedAt,
      };
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post("/integrations/:toolId/connect", requireAuth, validate({ params: toolIdParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const toolId = parseInt(String(req.params.toolId));
    const [existing] = await db.select().from(integrations)
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)));

    if (existing) {
      const [updated] = await db.update(integrations)
        .set({ status: "connected", connectedAt: new Date() })
        .where(eq(integrations.id, existing.id))
        .returning();
      res.json(updated);
      return;
    }

    const [created] = await db.insert(integrations).values({
      orgId, toolId, status: "connected", connectedAt: new Date(),
    }).returning();

    res.json(created);
  } catch (error) {
    next(error);
  }
});

router.post("/integrations/:toolId/disconnect", requireAuth, validate({ params: toolIdParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const toolId = parseInt(String(req.params.toolId));
    const [updated] = await db.update(integrations)
      .set({ status: "disconnected" })
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)))
      .returning();

    if (!updated) throw AppError.notFound("Integration not found");
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
