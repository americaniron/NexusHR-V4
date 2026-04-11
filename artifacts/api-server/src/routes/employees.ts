import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";

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
});

const updateEmployeeBody = z.object({
  name: z.string().min(1).max(200).optional(),
  department: z.string().optional(),
  team: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  personality: z.record(z.string(), z.unknown()).optional(),
  customInstructions: z.string().optional(),
});

router.get("/employees", requireAuth, validate({ query: listEmployeesQuery }), async (req, res) => {
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
    res.status(500).json({ error: "Failed to list employees", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/employees", requireAuth, validate({ body: createEmployeeBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(400).json({ error: "No organization", code: "BAD_REQUEST", statusCode: 400 });

    const { roleId, name, department, team, personality, customInstructions } = req.body;

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, roleId));
    if (!role) return res.status(404).json({ error: "Role not found", code: "NOT_FOUND", statusCode: 404 });

    const [employee] = await db.insert(aiEmployees).values({
      orgId,
      roleId,
      name,
      department: department || role.department,
      team,
      personality: personality || role.personalityDefaults,
      customInstructions,
      avatarUrl: role.avatarUrl,
      voiceId: null,
    }).returning();

    res.status(201).json({ ...employee, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to hire employee", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.get("/employees/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [employee] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!employee) return res.status(404).json({ error: "Employee not found", code: "NOT_FOUND", statusCode: 404 });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, employee.roleId));
    res.json({ ...employee, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to get employee", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.patch("/employees/:id", requireAuth, validate({ params: idParam, body: updateEmployeeBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Employee not found", code: "NOT_FOUND", statusCode: 404 });

    const { name, department, team, status, personality, customInstructions } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (team !== undefined) updates.team = team;
    if (status) updates.status = status;
    if (personality !== undefined) updates.personality = personality;
    if (customInstructions !== undefined) updates.customInstructions = customInstructions;

    const [updated] = await db.update(aiEmployees).set(updates).where(eq(aiEmployees.id, id)).returning();
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, updated.roleId));
    res.json({ ...updated, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to update employee", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.delete("/employees/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, id), eq(aiEmployees.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Employee not found", code: "NOT_FOUND", statusCode: 404 });

    const [updated] = await db.update(aiEmployees)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(aiEmployees.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate employee", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

export default router;
