import { Router } from "express";
import { db } from "@workspace/db";
import { toolRegistry, integrations, organizations } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

async function getOrgId(req: any): Promise<number | null> {
  const auth = getAuth(req);
  const clerkOrgId = auth?.orgId;
  if (!clerkOrgId) return null;
  const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
  return org?.id || null;
}

router.get("/integrations", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
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
    res.status(500).json({ error: "Failed to list integrations" });
  }
});

router.post("/integrations/:toolId/connect", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.status(400).json({ error: "No organization" });

    const toolId = parseInt(req.params.toolId);
    const [existing] = await db.select().from(integrations)
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)));

    if (existing) {
      const [updated] = await db.update(integrations)
        .set({ status: "connected", connectedAt: new Date() })
        .where(eq(integrations.id, existing.id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(integrations).values({
      orgId, toolId, status: "connected", connectedAt: new Date(),
    }).returning();

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to connect integration" });
  }
});

router.post("/integrations/:toolId/disconnect", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.status(400).json({ error: "No organization" });

    const toolId = parseInt(req.params.toolId);
    const [updated] = await db.update(integrations)
      .set({ status: "disconnected" })
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Integration not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to disconnect integration" });
  }
});

export default router;
