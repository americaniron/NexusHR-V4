import { Router } from "express";
import { db } from "@workspace/db";
import { workflows, workflowSteps } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";

const router = Router();

router.get("/workflows", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json(emptyPagination());

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const where = eq(workflows.orgId, orgId);
    const data = await db.select().from(workflows).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(workflows).where(where);

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
    const { orgId } = await getAuthContext(req);
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
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(String(req.params.id));
    const [workflow] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, id));
    res.json({ ...workflow, steps });
  } catch (error) {
    res.status(500).json({ error: "Failed to get workflow" });
  }
});

router.patch("/workflows/:id", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Workflow not found" });

    const { name, description, status } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const [updated] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    res.json({ ...updated, steps: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

router.delete("/workflows/:id", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Workflow not found" });

    await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, id));
    await db.delete(workflows).where(eq(workflows.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

export default router;
