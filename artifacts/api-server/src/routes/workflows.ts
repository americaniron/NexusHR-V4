import { Router } from "express";
import { db } from "@workspace/db";
import { workflows, workflowSteps } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";

const router = Router();

const createWorkflowBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  triggerType: z.string().optional(),
});

const updateWorkflowBody = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
});

router.get("/workflows", requireAuth, validate({ query: paginationQuery }), async (req, res) => {
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
    res.status(500).json({ error: "Failed to list workflows", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/workflows", requireAuth, validate({ body: createWorkflowBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(400).json({ error: "No organization", code: "BAD_REQUEST", statusCode: 400 });

    const { name, description, triggerType } = req.body;

    const [workflow] = await db.insert(workflows).values({
      orgId, name, description, triggerType,
    }).returning();

    res.status(201).json({ ...workflow, steps: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to create workflow", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.get("/workflows/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [workflow] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!workflow) return res.status(404).json({ error: "Workflow not found", code: "NOT_FOUND", statusCode: 404 });

    const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, id));
    res.json({ ...workflow, steps });
  } catch (error) {
    res.status(500).json({ error: "Failed to get workflow", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.patch("/workflows/:id", requireAuth, validate({ params: idParam, body: updateWorkflowBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Workflow not found", code: "NOT_FOUND", statusCode: 404 });

    const { name, description, status } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const [updated] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    res.json({ ...updated, steps: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update workflow", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.delete("/workflows/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Workflow not found", code: "NOT_FOUND", statusCode: 404 });

    await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, id));
    await db.delete(workflows).where(eq(workflows.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete workflow", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

export default router;
