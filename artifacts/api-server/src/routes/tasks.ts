import { Router } from "express";
import { db } from "@workspace/db";
import { tasks, aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, paginationQuery, idParam } from "../middlewares/validate";

const router = Router();

const listTasksQuery = paginationQuery.extend({
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional(),
  assigneeId: z.coerce.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

const createTaskBody = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigneeId: z.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateTaskBody = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  assigneeId: z.number().int().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  deliverable: z.string().optional(),
});

router.get("/tasks", requireAuth, validate({ query: listTasksQuery }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json(emptyPagination());

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const assigneeId = req.query.assigneeId as string | undefined;
    const priority = req.query.priority as string | undefined;

    const conditions = [eq(tasks.orgId, orgId)];
    if (status) conditions.push(eq(tasks.status, status));
    if (assigneeId) conditions.push(eq(tasks.assigneeId, parseInt(assigneeId)));
    if (priority) conditions.push(eq(tasks.priority, priority));

    const where = and(...conditions);
    const data = await db.select().from(tasks).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(where);

    const enriched = await Promise.all(data.map(async (task) => {
      if (task.assigneeId) {
        const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, task.assigneeId));
        if (emp) {
          const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
          return { ...task, assignee: { ...emp, role } };
        }
      }
      return { ...task, assignee: null };
    }));

    res.json({
      data: enriched,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list tasks", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.post("/tasks", requireAuth, validate({ body: createTaskBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(400).json({ error: "No organization", code: "BAD_REQUEST", statusCode: 400 });

    const { title, description, assigneeId, priority, category, dueDate } = req.body;

    const [task] = await db.insert(tasks).values({
      orgId,
      title,
      description,
      assigneeId: assigneeId || null,
      priority: priority || "medium",
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
    }).returning();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.get("/tasks/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [task] = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)));
    if (!task) return res.status(404).json({ error: "Task not found", code: "NOT_FOUND", statusCode: 404 });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.patch("/tasks/:id", requireAuth, validate({ params: idParam, body: updateTaskBody }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Task not found", code: "NOT_FOUND", statusCode: 404 });

    const { title, description, assigneeId, status, priority, deliverable } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assigneeId !== undefined) updates.assigneeId = assigneeId;
    if (status) {
      updates.status = status;
      if (status === "in_progress" && !existing.startedAt) updates.startedAt = new Date();
      if (status === "completed") updates.completedAt = new Date();
    }
    if (priority) updates.priority = priority;
    if (deliverable !== undefined) updates.deliverable = deliverable;

    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

router.delete("/tasks/:id", requireAuth, validate({ params: idParam }), async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden", code: "FORBIDDEN", statusCode: 403 });

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)));
    if (!existing) return res.status(404).json({ error: "Task not found", code: "NOT_FOUND", statusCode: 404 });

    await db.delete(tasks).where(eq(tasks.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task", code: "INTERNAL_ERROR", statusCode: 500 });
  }
});

export default router;
