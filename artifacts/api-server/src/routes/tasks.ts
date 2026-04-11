import { Router } from "express";
import { db } from "@workspace/db";
import { tasks, aiEmployees, aiEmployeeRoles, organizations } from "@workspace/db";
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

router.get("/tasks", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const { status, assigneeId, priority } = req.query;

    let conditions: any[] = [eq(tasks.orgId, orgId)];
    if (status) conditions.push(eq(tasks.status, status as string));
    if (assigneeId) conditions.push(eq(tasks.assigneeId, parseInt(assigneeId as string)));
    if (priority) conditions.push(eq(tasks.priority, priority as string));

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
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/tasks", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.status(400).json({ error: "No organization" });

    const { title, description, assigneeId, priority, category, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

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
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/tasks/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task" });
  }
});

router.patch("/tasks/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, assigneeId, status, priority, deliverable } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assigneeId !== undefined) updates.assigneeId = assigneeId;
    if (status) {
      updates.status = status;
      if (status === "in_progress" && !updates.startedAt) updates.startedAt = new Date();
      if (status === "completed") updates.completedAt = new Date();
    }
    if (priority) updates.priority = priority;
    if (deliverable !== undefined) updates.deliverable = deliverable;

    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

export default router;
