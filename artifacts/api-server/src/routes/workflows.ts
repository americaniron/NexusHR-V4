import { Router } from "express";
import { db } from "@workspace/db";
import { workflows, workflowSteps, organizations } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
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

router.get("/workflows", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const data = await db.select().from(workflows).where(eq(workflows.orgId, orgId)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(workflows).where(eq(workflows.orgId, orgId));

    const enriched = await Promise.all(data.map(async (wf) => {
      const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, wf.id));
      return { ...wf, steps };
    }));

    res.json({
      data: enriched,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list workflows" });
  }
});

router.post("/workflows", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.status(400).json({ error: "No organization" });

    const { name, description, triggerType } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const [workflow] = await db.insert(workflows).values({
      orgId, name, description, triggerType,
    }).returning();

    res.status(201).json({ ...workflow, steps: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

router.get("/workflows/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, id));
    res.json({ ...workflow, steps });
  } catch (error) {
    res.status(500).json({ error: "Failed to get workflow" });
  }
});

router.patch("/workflows/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const [updated] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Workflow not found" });
    res.json({ ...updated, steps: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

export default router;
