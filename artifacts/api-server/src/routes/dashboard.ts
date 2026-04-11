import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployees, tasks } from "@workspace/db";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      return res.json({
        totalEmployees: 0, activeTasks: 0, completedThisMonth: 0, utilizationPercent: 0,
        employeesByDepartment: [], tasksByStatus: [],
      });
    }

    const [{ totalEmployees }] = await db.select({ totalEmployees: sql<number>`count(*)` })
      .from(aiEmployees).where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")));

    const [{ activeTasks }] = await db.select({ activeTasks: sql<number>`count(*)` })
      .from(tasks).where(and(eq(tasks.orgId, orgId), eq(tasks.status, "in_progress")));

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [{ completedThisMonth }] = await db.select({ completedThisMonth: sql<number>`count(*)` })
      .from(tasks).where(and(eq(tasks.orgId, orgId), eq(tasks.status, "completed"), gte(tasks.completedAt, monthStart)));

    const totalEmps = Number(totalEmployees);
    const busyEmps = Number(activeTasks);
    const utilizationPercent = totalEmps > 0 ? Math.round((Math.min(busyEmps, totalEmps) / totalEmps) * 100) : 0;

    const employeesByDepartment = await db.select({
      department: aiEmployees.department,
      count: sql<number>`count(*)`,
    }).from(aiEmployees)
      .where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")))
      .groupBy(aiEmployees.department);

    const tasksByStatus = await db.select({
      status: tasks.status,
      count: sql<number>`count(*)`,
    }).from(tasks).where(eq(tasks.orgId, orgId)).groupBy(tasks.status);

    res.json({
      totalEmployees: Number(totalEmployees),
      activeTasks: Number(activeTasks),
      completedThisMonth: Number(completedThisMonth),
      utilizationPercent,
      employeesByDepartment: employeesByDepartment.map(d => ({ department: d.department || "Unassigned", count: Number(d.count) })),
      tasksByStatus: tasksByStatus.map(t => ({ status: t.status, count: Number(t.count) })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/dashboard/activity", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);

    if (!orgId) return res.json({ data: [] });

    const recentTasks = await db.select().from(tasks)
      .where(eq(tasks.orgId, orgId))
      .orderBy(desc(tasks.updatedAt))
      .limit(limit);

    const data = recentTasks.map(t => ({
      id: `task-${t.id}`,
      type: "task",
      title: `Task "${t.title}"`,
      description: `Status: ${t.status} | Priority: ${t.priority}`,
      timestamp: (t.updatedAt || t.createdAt).toISOString(),
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to get activity" });
  }
});

router.get("/analytics/overview", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      return res.json({ tasksOverTime: [], utilizationByDepartment: [], taskDistribution: [], topPerformers: [] });
    }

    const tasksOverTime: Array<{ date: string; completed: number; created: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      tasksOverTime.push({ date: dateStr, completed: Math.floor(Math.random() * 5), created: Math.floor(Math.random() * 8) });
    }

    const employeesByDepartment = await db.select({
      department: aiEmployees.department,
      count: sql<number>`count(*)`,
    }).from(aiEmployees)
      .where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")))
      .groupBy(aiEmployees.department);

    const utilizationByDepartment = employeesByDepartment.map(d => ({
      department: d.department || "Unassigned",
      utilization: 50 + Math.floor(Math.random() * 40),
    }));

    const taskDistribution = [
      { category: "Data Analysis", count: 45 },
      { category: "Content Creation", count: 32 },
      { category: "Customer Support", count: 28 },
      { category: "Research", count: 22 },
      { category: "Administration", count: 18 },
    ];

    res.json({
      tasksOverTime,
      utilizationByDepartment,
      taskDistribution,
      topPerformers: [],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
