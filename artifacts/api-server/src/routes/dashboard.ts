import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployees, tasks } from "@workspace/db";
import { eq, and, sql, gte, desc, lte } from "drizzle-orm";
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedByDay = await db.select({
      date: sql<string>`to_char(${tasks.completedAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)`,
    }).from(tasks)
      .where(and(
        eq(tasks.orgId, orgId),
        eq(tasks.status, "completed"),
        gte(tasks.completedAt, thirtyDaysAgo)
      ))
      .groupBy(sql`to_char(${tasks.completedAt}, 'YYYY-MM-DD')`);

    const createdByDay = await db.select({
      date: sql<string>`to_char(${tasks.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)`,
    }).from(tasks)
      .where(and(
        eq(tasks.orgId, orgId),
        gte(tasks.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`to_char(${tasks.createdAt}, 'YYYY-MM-DD')`);

    const completedMap = new Map(completedByDay.map(r => [r.date, Number(r.count)]));
    const createdMap = new Map(createdByDay.map(r => [r.date, Number(r.count)]));

    const tasksOverTime: Array<{ date: string; completed: number; created: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      tasksOverTime.push({
        date: dateStr,
        completed: completedMap.get(dateStr) || 0,
        created: createdMap.get(dateStr) || 0,
      });
    }

    const employeesByDepartment = await db.select({
      department: aiEmployees.department,
      total: sql<number>`count(*)`,
    }).from(aiEmployees)
      .where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")))
      .groupBy(aiEmployees.department);

    const tasksByAssignee = await db.select({
      assigneeId: tasks.assignedToId,
      activeCount: sql<number>`count(*)`,
    }).from(tasks)
      .where(and(eq(tasks.orgId, orgId), eq(tasks.status, "in_progress")))
      .groupBy(tasks.assignedToId);

    const activeByEmployee = new Map(
      tasksByAssignee.filter(t => t.assigneeId != null).map(t => [t.assigneeId, Number(t.activeCount)])
    );

    const utilizationByDepartment = await Promise.all(
      employeesByDepartment.map(async (d) => {
        const deptEmployees = await db.select({ id: aiEmployees.id }).from(aiEmployees)
          .where(and(
            eq(aiEmployees.orgId, orgId),
            eq(aiEmployees.status, "active"),
            eq(aiEmployees.department, d.department!)
          ));

        const busyCount = deptEmployees.filter(e => activeByEmployee.has(e.id)).length;
        const total = Number(d.total);
        return {
          department: d.department || "Unassigned",
          utilization: total > 0 ? Math.round((busyCount / total) * 100) : 0,
        };
      })
    );

    const taskDistributionRows = await db.select({
      category: aiEmployees.department,
      count: sql<number>`count(*)`,
    }).from(tasks)
      .innerJoin(aiEmployees, eq(tasks.assignedToId, aiEmployees.id))
      .where(eq(tasks.orgId, orgId))
      .groupBy(aiEmployees.department);

    const taskDistribution = taskDistributionRows.map(r => ({
      category: r.category || "Unassigned",
      count: Number(r.count),
    }));

    const topPerformerRows = await db.select({
      employeeId: tasks.assignedToId,
      completed: sql<number>`count(*)`,
    }).from(tasks)
      .where(and(eq(tasks.orgId, orgId), eq(tasks.status, "completed")))
      .groupBy(tasks.assignedToId)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const topPerformers = await Promise.all(
      topPerformerRows.filter(r => r.employeeId != null).map(async (r) => {
        const [emp] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, r.employeeId!));
        return emp ? { id: emp.id, name: emp.name, department: emp.department, completedTasks: Number(r.completed) } : null;
      })
    );

    res.json({
      tasksOverTime,
      utilizationByDepartment,
      taskDistribution,
      topPerformers: topPerformers.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
