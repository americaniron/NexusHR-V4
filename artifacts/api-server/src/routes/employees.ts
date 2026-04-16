import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { getDiceBearFallback, type AvatarIdentityPackage } from "../lib/avatars";
import { publishEvent } from "../lib/websocket";
import { requirePlanLimit } from "../middlewares/planLimits";
import { recordUsage, checkAllCountBasedLimits } from "../lib/billing/metering";

const router = Router();

const listEmployeesQuery = paginationQuery.extend({
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  department: z.string().optional(),
});

const createEmployeeBody = z.object({
  roleId: z.number().int().min(1),
  name: z.string().min(1).max(200),
  department: z.string().optional(),
  team: z.string().optional(),
  personality: z.record(z.string(), z.unknown()).optional(),
  customInstructions: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  voiceId: z.string().optional(),
  voiceLanguage: z.string().max(10).optional(),
});

const updateEmployeeBody = z.object({
  name: z.string().min(1).max(200).optional(),
  department: z.string().optional(),
  team: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  personality: z.record(z.string(), z.unknown()).optional(),
  customInstructions: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  voiceId: z.string().optional(),
  voiceLanguage: z.string().max(10).optional(),
});

router.get("/employees", requireAuth, validate({ query: listEmployeesQuery }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json(emptyPagination());

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const department = req.query.department as string | undefined;

    const conditions = [eq(aiEmployees.orgId, orgId)];
    if (status) conditions.push(eq(aiEmployees.status, status));
    if (department) conditions.push(eq(aiEmployees.department, department));

    const where = and(...conditions);
    const data = await db.select().from(aiEmployees).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(aiEmployees).where(where);

    const enriched = await Promise.all(data.map(async (emp) => {
      const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
      return { ...emp, role };
    }));

    res.json({
      data: enriched,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/employees", requireAuth, requirePlanLimit("ai_employees"), validate({ body: createEmployeeBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { roleId, name, department, team, personality, customInstructions, avatarUrl, voiceId, voiceLanguage } = req.body;

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, roleId));
    if (!role) throw AppError.notFound("Role not found");

    const resolvedAvatarUrl = avatarUrl || role.avatarUrl || getDiceBearFallback(name || role.title);
    const aip: AvatarIdentityPackage = {
      version: 1,
      avatarUrl: resolvedAvatarUrl,
      voiceId: voiceId || undefined,
      renderConfig: {
        size: "512x512",
        style: resolvedAvatarUrl?.includes("dicebear.com") ? "dicebear" : "photorealistic",
        generationParams: {
          roleTitle: role.title,
          industry: role.industry,
          seniority: role.seniorityLevel,
        },
      },
    };

    const [employee] = await db.insert(aiEmployees).values({
      orgId,
      roleId,
      name,
      department: department || role.department,
      team,
      personality: personality || role.personalityDefaults,
      customInstructions,
      avatarUrl: resolvedAvatarUrl,
      avatarConfig: aip,
      voiceId: voiceId || null,
      voiceLanguage: voiceLanguage || "en",
    }).returning();

    await recordUsage(orgId, "ai_employees", 1, { employeeId: employee.id, roleId: role.id });
    await checkAllCountBasedLimits(orgId);
    publishEvent(orgId, "employees", "employee:hired", { ...employee, role });
    res.status(201).json({ ...employee, role });
  } catch (error) {
    next(error);
  }
});

router.get("/employees/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [employee] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!employee) throw AppError.notFound("Employee not found");

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, employee.roleId));
    res.json({ ...employee, role });
  } catch (error) {
    next(error);
  }
});

router.patch("/employees/:id", requireAuth, validate({ params: idParam, body: updateEmployeeBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!existing) throw AppError.notFound("Employee not found");

    const { name, department, team, status, personality, customInstructions, avatarUrl, voiceId, voiceLanguage } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (team !== undefined) updates.team = team;
    if (status) updates.status = status;
    if (personality !== undefined) updates.personality = personality;
    if (customInstructions !== undefined) updates.customInstructions = customInstructions;
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
      const existingAip = (existing.avatarConfig || {}) as Record<string, unknown>;
      updates.avatarConfig = {
        ...existingAip,
        avatarUrl,
        renderConfig: {
          ...((existingAip.renderConfig as Record<string, unknown>) || {}),
          style: avatarUrl?.includes("dicebear.com") ? "dicebear" : "photorealistic",
        },
      };
    }
    if (voiceId !== undefined) {
      updates.voiceId = voiceId;
      const existingAip = (updates.avatarConfig || existing.avatarConfig || {}) as Record<string, unknown>;
      updates.avatarConfig = { ...existingAip, voiceId };
    }
    if (voiceLanguage !== undefined) updates.voiceLanguage = voiceLanguage;

    const [updated] = await db.update(aiEmployees).set(updates).where(eq(aiEmployees.id, id)).returning();
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, updated.roleId));
    publishEvent(orgId, "employees", "employee:updated", { ...updated, role });
    res.json({ ...updated, role });
  } catch (error) {
    next(error);
  }
});

router.delete("/employees/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!existing) throw AppError.notFound("Employee not found");

    const [updated] = await db.update(aiEmployees)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(aiEmployees.id, id))
      .returning();
    publishEvent(orgId, "employees", "employee:deactivated", updated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
