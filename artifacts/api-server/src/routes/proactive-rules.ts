import { Router } from "express";
import { db } from "@workspace/db";
import { proactiveRules, proactiveExecutions, aiEmployees } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../lib/logger";

const router = Router();

const createRuleBody = z.object({
  aiEmployeeId: z.number().int().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["scheduled", "trigger"]),
  schedule: z.string().max(100).optional(),
  triggerEvent: z.string().max(100).optional(),
  triggerConditions: z.record(z.string(), z.unknown()).optional(),
  actionType: z.enum(["send_message", "create_task", "send_summary"]).default("send_message"),
  actionConfig: z.record(z.string(), z.unknown()).optional(),
  messageTemplate: z.string().max(2000).optional(),
  enabled: z.boolean().default(true),
  maxPerDay: z.number().int().min(1).max(50).default(5),
});

const updateRuleBody = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  schedule: z.string().max(100).optional(),
  triggerEvent: z.string().max(100).optional(),
  triggerConditions: z.record(z.string(), z.unknown()).optional(),
  actionType: z.enum(["send_message", "create_task", "send_summary"]).optional(),
  actionConfig: z.record(z.string(), z.unknown()).optional(),
  messageTemplate: z.string().max(2000).optional(),
  enabled: z.boolean().optional(),
  maxPerDay: z.number().int().min(1).max(50).optional(),
});

const employeeIdParam = z.object({
  employeeId: z.coerce.number().int().min(1),
});

router.get("/proactive-rules/employee/:employeeId", requireAuth, validate({ params: employeeIdParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ data: [] });

    const employeeId = parseInt(String(req.params.employeeId));
    const rules = await db
      .select()
      .from(proactiveRules)
      .where(and(
        eq(proactiveRules.orgId, orgId),
        eq(proactiveRules.aiEmployeeId, employeeId),
      ))
      .orderBy(desc(proactiveRules.createdAt));

    res.json({ data: rules });
  } catch (error) {
    next(error);
  }
});

router.get("/proactive-rules/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [rule] = await db
      .select()
      .from(proactiveRules)
      .where(and(eq(proactiveRules.id, id), eq(proactiveRules.orgId, orgId)));

    if (!rule) throw AppError.notFound("Proactive rule not found");
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

router.post("/proactive-rules", requireAuth, validate({ body: createRuleBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const body = req.body;

    const [employee] = await db
      .select()
      .from(aiEmployees)
      .where(and(eq(aiEmployees.id, body.aiEmployeeId), eq(aiEmployees.orgId, orgId)));
    if (!employee) throw AppError.notFound("AI employee not found");

    if (body.type === "scheduled" && !body.schedule) {
      throw AppError.badRequest("Schedule is required for scheduled rules");
    }
    if (body.type === "trigger" && !body.triggerEvent) {
      throw AppError.badRequest("Trigger event is required for trigger rules");
    }

    const [rule] = await db
      .insert(proactiveRules)
      .values({
        orgId,
        aiEmployeeId: body.aiEmployeeId,
        name: body.name,
        description: body.description,
        type: body.type,
        schedule: body.schedule,
        triggerEvent: body.triggerEvent,
        triggerConditions: body.triggerConditions,
        actionType: body.actionType,
        actionConfig: body.actionConfig,
        messageTemplate: body.messageTemplate,
        enabled: body.enabled,
        maxPerDay: body.maxPerDay,
      })
      .returning();

    logger.info({ ruleId: rule.id, type: rule.type }, "Proactive rule created");
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

router.put("/proactive-rules/:id", requireAuth, validate({ params: idParam, body: updateRuleBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db
      .select()
      .from(proactiveRules)
      .where(and(eq(proactiveRules.id, id), eq(proactiveRules.orgId, orgId)));
    if (!existing) throw AppError.notFound("Proactive rule not found");

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const body = req.body;

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.schedule !== undefined) updates.schedule = body.schedule;
    if (body.triggerEvent !== undefined) updates.triggerEvent = body.triggerEvent;
    if (body.triggerConditions !== undefined) updates.triggerConditions = body.triggerConditions;
    if (body.actionType !== undefined) updates.actionType = body.actionType;
    if (body.actionConfig !== undefined) updates.actionConfig = body.actionConfig;
    if (body.messageTemplate !== undefined) updates.messageTemplate = body.messageTemplate;
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    if (body.maxPerDay !== undefined) updates.maxPerDay = body.maxPerDay;

    const [updated] = await db
      .update(proactiveRules)
      .set(updates)
      .where(eq(proactiveRules.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.patch("/proactive-rules/:id/toggle", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db
      .select()
      .from(proactiveRules)
      .where(and(eq(proactiveRules.id, id), eq(proactiveRules.orgId, orgId)));
    if (!existing) throw AppError.notFound("Proactive rule not found");

    const [updated] = await db
      .update(proactiveRules)
      .set({ enabled: !existing.enabled, updatedAt: new Date() })
      .where(eq(proactiveRules.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/proactive-rules/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db
      .select()
      .from(proactiveRules)
      .where(and(eq(proactiveRules.id, id), eq(proactiveRules.orgId, orgId)));
    if (!existing) throw AppError.notFound("Proactive rule not found");

    await db.delete(proactiveExecutions).where(eq(proactiveExecutions.ruleId, id));
    await db.delete(proactiveRules).where(eq(proactiveRules.id, id));

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/proactive-rules/:id/executions", requireAuth, validate({ params: idParam, query: paginationQuery }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json(emptyPagination());

    const id = parseInt(String(req.params.id));
    const [rule] = await db
      .select()
      .from(proactiveRules)
      .where(and(eq(proactiveRules.id, id), eq(proactiveRules.orgId, orgId)));
    if (!rule) throw AppError.notFound("Proactive rule not found");

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(proactiveExecutions)
      .where(eq(proactiveExecutions.ruleId, id))
      .orderBy(desc(proactiveExecutions.executedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(proactiveExecutions)
      .where(eq(proactiveExecutions.ruleId, id));

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
