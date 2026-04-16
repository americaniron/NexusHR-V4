import { Router } from "express";
import { db } from "@workspace/db";
import { workflows, workflowSteps } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { requirePlanLimit } from "../middlewares/planLimits";
import { recordUsage } from "../lib/billing/metering";

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

router.get("/workflows", requireAuth, validate({ query: paginationQuery }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json(emptyPagination());

    const { page = 1, limit = 12 } = req.query as Record<string, unknown>;
    const pageNum = page as number;
    const limitNum = limit as number;
    const offset = (pageNum - 1) * limitNum;

    const where = eq(workflows.orgId, orgId);
    const data = await db.select().from(workflows).where(where).limit(limitNum).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(workflows).where(where);

    const enriched = await Promise.all(data.map(async (wf) => {
      const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, wf.id));
      return { ...wf, steps };
    }));

    res.json({
      data: enriched,
      pagination: { page: pageNum, limit: limitNum, total: Number(count), totalPages: Math.ceil(Number(count) / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/workflows", requireAuth, requirePlanLimit("workflows"), validate({ body: createWorkflowBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { name, description, triggerType } = req.body;

    const [workflow] = await db.insert(workflows).values({
      orgId, name, description, triggerType,
    }).returning();

    await recordUsage(orgId, "workflows", 1, { workflowId: workflow.id });
    res.status(201).json({ ...workflow, steps: [] });
  } catch (error) {
    next(error);
  }
});

router.get("/workflows/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = req.params.id as unknown as number;
    const [workflow] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!workflow) throw AppError.notFound("Workflow not found");

    const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.workflowId, id));
    res.json({ ...workflow, steps });
  } catch (error) {
    next(error);
  }
});

router.patch("/workflows/:id", requireAuth, validate({ params: idParam, body: updateWorkflowBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = req.params.id as unknown as number;
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) throw AppError.notFound("Workflow not found");

    const { name, description, status } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const [updated] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    res.json({ ...updated, steps: [] });
  } catch (error) {
    next(error);
  }
});

router.delete("/workflows/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = req.params.id as unknown as number;
    const [existing] = await db.select().from(workflows).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
    if (!existing) throw AppError.notFound("Workflow not found");

    await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, id));
    await db.delete(workflows).where(eq(workflows.id, id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
