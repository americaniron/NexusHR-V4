import { Router } from "express";
import { db } from "@workspace/db";
import { responseRatings, slaConfigs, csatResponses, aiEmployees, tasks, messages, conversations } from "@workspace/db";
import { eq, and, sql, gte, desc, avg, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, idParam } from "../middlewares/validate";

const router = Router();

const rateMessageBody = z.object({
  messageId: z.number().int().min(1),
  conversationId: z.number().int().min(1),
  aiEmployeeId: z.number().int().min(1),
  rating: z.number().int().min(0).max(1),
});

router.post("/analytics/ratings", requireAuth, validate({ body: rateMessageBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(403).json({ error: "Forbidden" });

    const { messageId, conversationId, aiEmployeeId, rating } = req.body;

    const existing = await db.select().from(responseRatings).where(
      and(eq(responseRatings.messageId, messageId), eq(responseRatings.userId, userId))
    );

    if (existing.length > 0) {
      const [updated] = await db.update(responseRatings)
        .set({ rating })
        .where(eq(responseRatings.id, existing[0].id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(responseRatings).values({
      orgId, aiEmployeeId, conversationId, messageId, userId, rating,
    }).returning();

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/ratings/message/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    const messageId = parseInt(String(req.params.id));

    const [existing] = await db.select().from(responseRatings).where(
      and(eq(responseRatings.messageId, messageId), eq(responseRatings.userId, userId!))
    );

    res.json({ rating: existing?.rating ?? null });
  } catch (error) {
    next(error);
  }
});

const slaConfigBody = z.object({
  targetResponseTimeSec: z.number().int().min(10).max(86400).optional(),
  targetTaskCompletionMin: z.number().int().min(1).max(43200).optional(),
});

router.get("/analytics/sla/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const employeeId = parseInt(String(req.params.id));
    const [config] = await db.select().from(slaConfigs).where(
      and(eq(slaConfigs.aiEmployeeId, employeeId), eq(slaConfigs.orgId, orgId))
    );

    res.json(config || { targetResponseTimeSec: 300, targetTaskCompletionMin: 60 });
  } catch (error) {
    next(error);
  }
});

router.put("/analytics/sla/:id", requireAuth, validate({ params: idParam, body: slaConfigBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const employeeId = parseInt(String(req.params.id));
    const { targetResponseTimeSec, targetTaskCompletionMin } = req.body;

    const [existing] = await db.select().from(slaConfigs).where(
      and(eq(slaConfigs.aiEmployeeId, employeeId), eq(slaConfigs.orgId, orgId))
    );

    if (existing) {
      const [updated] = await db.update(slaConfigs)
        .set({
          ...(targetResponseTimeSec !== undefined && { targetResponseTimeSec }),
          ...(targetTaskCompletionMin !== undefined && { targetTaskCompletionMin }),
          updatedAt: new Date(),
        })
        .where(eq(slaConfigs.id, existing.id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(slaConfigs).values({
      orgId, aiEmployeeId: employeeId,
      targetResponseTimeSec: targetResponseTimeSec ?? 300,
      targetTaskCompletionMin: targetTaskCompletionMin ?? 60,
    }).returning();

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

const csatBody = z.object({
  aiEmployeeId: z.number().int().min(1),
  conversationId: z.number().int().min(1),
  score: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

router.post("/analytics/csat", requireAuth, validate({ body: csatBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(403).json({ error: "Forbidden" });

    const { aiEmployeeId, conversationId, score, feedback } = req.body;

    const existing = await db.select().from(csatResponses).where(
      and(
        eq(csatResponses.conversationId, conversationId),
        eq(csatResponses.userId, userId)
      )
    );

    if (existing.length > 0) {
      const [updated] = await db.update(csatResponses)
        .set({ score, feedback })
        .where(eq(csatResponses.id, existing[0].id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db.insert(csatResponses).values({
      orgId, aiEmployeeId, conversationId, userId, score, feedback,
    }).returning();

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/csat/check/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    const conversationId = parseInt(String(req.params.id));

    const [existing] = await db.select().from(csatResponses).where(
      and(eq(csatResponses.conversationId, conversationId), eq(csatResponses.userId, userId!))
    );

    res.json({ submitted: !!existing, score: existing?.score ?? null });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/quality-metrics", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ avgRating: 0, slaCompliance: 0, csatScore: 0, totalRatings: 0, totalCsat: 0 });

    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [ratingResult] = await db.select({
      avgRating: sql<number>`COALESCE(AVG(${responseRatings.rating}::float) * 100, 0)`,
      totalRatings: sql<number>`COUNT(*)`,
      positiveRatings: sql<number>`SUM(CASE WHEN ${responseRatings.rating} = 1 THEN 1 ELSE 0 END)`,
    }).from(responseRatings).where(
      and(eq(responseRatings.orgId, orgId), gte(responseRatings.createdAt, since))
    );

    const [csatResult] = await db.select({
      avgScore: sql<number>`COALESCE(AVG(${csatResponses.score}::float), 0)`,
      totalCsat: sql<number>`COUNT(*)`,
    }).from(csatResponses).where(
      and(eq(csatResponses.orgId, orgId), gte(csatResponses.createdAt, since))
    );

    const orgTasks = await db.select({
      id: tasks.id,
      assigneeId: tasks.assigneeId,
      startedAt: tasks.startedAt,
      completedAt: tasks.completedAt,
      status: tasks.status,
    }).from(tasks).where(
      and(eq(tasks.orgId, orgId), gte(tasks.createdAt, since))
    );

    const slaConfigsList = await db.select().from(slaConfigs).where(eq(slaConfigs.orgId, orgId));
    const slaMap = new Map(slaConfigsList.map(c => [c.aiEmployeeId, c]));

    let slaCompliant = 0;
    let slaTotal = 0;
    for (const t of orgTasks) {
      if (t.status === "completed" && t.startedAt && t.completedAt && t.assigneeId) {
        slaTotal++;
        const config = slaMap.get(t.assigneeId);
        const targetMin = config?.targetTaskCompletionMin ?? 60;
        const actualMin = (t.completedAt.getTime() - t.startedAt.getTime()) / 60000;
        if (actualMin <= targetMin) slaCompliant++;
      }
    }

    const slaCompliance = slaTotal > 0 ? Math.round((slaCompliant / slaTotal) * 100) : 100;

    res.json({
      avgRating: Math.round(Number(ratingResult.avgRating)),
      positiveRatings: Number(ratingResult.positiveRatings) || 0,
      totalRatings: Number(ratingResult.totalRatings) || 0,
      slaCompliance,
      slaTotal,
      csatScore: Number(Number(csatResult.avgScore).toFixed(1)),
      totalCsat: Number(csatResult.totalCsat) || 0,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/employee/:id/performance", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const employeeId = parseInt(String(req.params.id));
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [ratingResult] = await db.select({
      avgRating: sql<number>`COALESCE(AVG(${responseRatings.rating}::float) * 100, 0)`,
      totalRatings: sql<number>`COUNT(*)`,
      positiveRatings: sql<number>`SUM(CASE WHEN ${responseRatings.rating} = 1 THEN 1 ELSE 0 END)`,
    }).from(responseRatings).where(
      and(eq(responseRatings.aiEmployeeId, employeeId), gte(responseRatings.createdAt, since))
    );

    const [csatResult] = await db.select({
      avgScore: sql<number>`COALESCE(AVG(${csatResponses.score}::float), 0)`,
      totalCsat: sql<number>`COUNT(*)`,
    }).from(csatResponses).where(
      and(eq(csatResponses.aiEmployeeId, employeeId), gte(csatResponses.createdAt, since))
    );

    const empTasks = await db.select().from(tasks).where(
      and(eq(tasks.assigneeId, employeeId), eq(tasks.orgId, orgId), gte(tasks.createdAt, since))
    );

    const completedTasks = empTasks.filter(t => t.status === "completed");
    const [slaConfig] = await db.select().from(slaConfigs).where(
      and(eq(slaConfigs.aiEmployeeId, employeeId), eq(slaConfigs.orgId, orgId))
    );

    const targetMin = slaConfig?.targetTaskCompletionMin ?? 60;
    let slaCompliant = 0;
    const completionTimes: number[] = [];
    for (const t of completedTasks) {
      if (t.startedAt && t.completedAt) {
        const mins = (t.completedAt.getTime() - t.startedAt.getTime()) / 60000;
        completionTimes.push(mins);
        if (mins <= targetMin) slaCompliant++;
      }
    }

    const slaCompliance = completedTasks.length > 0
      ? Math.round((slaCompliant / completedTasks.length) * 100)
      : 100;

    completionTimes.sort((a, b) => a - b);
    const p50 = completionTimes.length > 0 ? completionTimes[Math.floor(completionTimes.length * 0.5)] : 0;
    const p95 = completionTimes.length > 0 ? completionTimes[Math.floor(completionTimes.length * 0.95)] : 0;

    const ratingsByWeek = await db.select({
      week: sql<string>`to_char(${responseRatings.createdAt}, 'IYYY-IW')`,
      avgRating: sql<number>`AVG(${responseRatings.rating}::float) * 100`,
      count: sql<number>`COUNT(*)`,
    }).from(responseRatings).where(
      and(eq(responseRatings.aiEmployeeId, employeeId), gte(responseRatings.createdAt, since))
    ).groupBy(sql`to_char(${responseRatings.createdAt}, 'IYYY-IW')`);

    const csatByWeek = await db.select({
      week: sql<string>`to_char(${csatResponses.createdAt}, 'IYYY-IW')`,
      avgScore: sql<number>`AVG(${csatResponses.score}::float)`,
      count: sql<number>`COUNT(*)`,
    }).from(csatResponses).where(
      and(eq(csatResponses.aiEmployeeId, employeeId), gte(csatResponses.createdAt, since))
    ).groupBy(sql`to_char(${csatResponses.createdAt}, 'IYYY-IW')`);

    const tasksByWeek = await db.select({
      week: sql<string>`to_char(${tasks.createdAt}, 'IYYY-IW')`,
      completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
    }).from(tasks).where(
      and(eq(tasks.assigneeId, employeeId), eq(tasks.orgId, orgId), gte(tasks.createdAt, since))
    ).groupBy(sql`to_char(${tasks.createdAt}, 'IYYY-IW')`);

    res.json({
      avgRating: Math.round(Number(ratingResult.avgRating)),
      positiveRatings: Number(ratingResult.positiveRatings) || 0,
      totalRatings: Number(ratingResult.totalRatings) || 0,
      csatScore: Number(Number(csatResult.avgScore).toFixed(1)),
      totalCsat: Number(csatResult.totalCsat) || 0,
      slaCompliance,
      totalTasks: empTasks.length,
      completedTasks: completedTasks.length,
      avgCompletionTimeMin: p50,
      p95CompletionTimeMin: p95,
      targetResponseTimeSec: slaConfig?.targetResponseTimeSec ?? 300,
      targetTaskCompletionMin: targetMin,
      ratingsTrend: ratingsByWeek.map(r => ({
        week: r.week,
        value: Math.round(Number(r.avgRating)),
        count: Number(r.count),
      })),
      csatTrend: csatByWeek.map(r => ({
        week: r.week,
        value: Number(Number(r.avgScore).toFixed(1)),
        count: Number(r.count),
      })),
      tasksTrend: tasksByWeek.map(r => ({
        week: r.week,
        completed: Number(r.completed),
        total: Number(r.total),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/trends", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ currentWeek: {}, previousWeek: {}, trends: {} });

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [currentTasks] = await db.select({
      completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
    }).from(tasks).where(
      and(eq(tasks.orgId, orgId), gte(tasks.createdAt, oneWeekAgo))
    );

    const [prevTasks] = await db.select({
      completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
    }).from(tasks).where(
      and(eq(tasks.orgId, orgId), gte(tasks.createdAt, twoWeeksAgo), sql`${tasks.createdAt} < ${oneWeekAgo}`)
    );

    const [currentRatings] = await db.select({
      avg: sql<number>`COALESCE(AVG(${responseRatings.rating}::float) * 100, 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(responseRatings).where(
      and(eq(responseRatings.orgId, orgId), gte(responseRatings.createdAt, oneWeekAgo))
    );

    const [prevRatings] = await db.select({
      avg: sql<number>`COALESCE(AVG(${responseRatings.rating}::float) * 100, 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(responseRatings).where(
      and(eq(responseRatings.orgId, orgId), gte(responseRatings.createdAt, twoWeeksAgo), sql`${responseRatings.createdAt} < ${oneWeekAgo}`)
    );

    const [currentCsat] = await db.select({
      avg: sql<number>`COALESCE(AVG(${csatResponses.score}::float), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(csatResponses).where(
      and(eq(csatResponses.orgId, orgId), gte(csatResponses.createdAt, oneWeekAgo))
    );

    const [prevCsat] = await db.select({
      avg: sql<number>`COALESCE(AVG(${csatResponses.score}::float), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(csatResponses).where(
      and(eq(csatResponses.orgId, orgId), gte(csatResponses.createdAt, twoWeeksAgo), sql`${csatResponses.createdAt} < ${oneWeekAgo}`)
    );

    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const curCompleted = Number(currentTasks.completed) || 0;
    const prevCompleted = Number(prevTasks.completed) || 0;
    const curRating = Number(currentRatings.avg);
    const prevRating = Number(prevRatings.avg);
    const curCsatVal = Number(currentCsat.avg);
    const prevCsatVal = Number(prevCsat.avg);

    res.json({
      currentWeek: {
        tasksCompleted: curCompleted,
        totalTasks: Number(currentTasks.total) || 0,
        avgRating: Math.round(curRating),
        csatScore: Number(curCsatVal.toFixed(1)),
        totalRatings: Number(currentRatings.count) || 0,
        totalCsat: Number(currentCsat.count) || 0,
      },
      previousWeek: {
        tasksCompleted: prevCompleted,
        totalTasks: Number(prevTasks.total) || 0,
        avgRating: Math.round(prevRating),
        csatScore: Number(prevCsatVal.toFixed(1)),
        totalRatings: Number(prevRatings.count) || 0,
        totalCsat: Number(prevCsat.count) || 0,
      },
      trends: {
        tasksCompletedChange: calcChange(curCompleted, prevCompleted),
        avgRatingChange: calcChange(curRating, prevRating),
        csatChange: calcChange(curCsatVal, prevCsatVal),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/export", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const format = (req.query.format as string) || "csv";
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
    const period = (req.query.period as string) || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    let employeeFilter = eq(aiEmployees.orgId, orgId);

    const emps = employeeId
      ? await db.select().from(aiEmployees).where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.orgId, orgId)))
      : await db.select().from(aiEmployees).where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")));

    const rows: Array<Record<string, string | number>> = [];

    for (const emp of emps) {
      const empTasks = await db.select().from(tasks).where(
        and(eq(tasks.assigneeId, emp.id), eq(tasks.orgId, orgId), gte(tasks.createdAt, since))
      );
      const completed = empTasks.filter(t => t.status === "completed").length;

      const [ratingResult] = await db.select({
        avg: sql<number>`COALESCE(AVG(${responseRatings.rating}::float) * 100, 0)`,
        total: sql<number>`COUNT(*)`,
      }).from(responseRatings).where(
        and(eq(responseRatings.aiEmployeeId, emp.id), gte(responseRatings.createdAt, since))
      );

      const [csatResult] = await db.select({
        avg: sql<number>`COALESCE(AVG(${csatResponses.score}::float), 0)`,
        total: sql<number>`COUNT(*)`,
      }).from(csatResponses).where(
        and(eq(csatResponses.aiEmployeeId, emp.id), gte(csatResponses.createdAt, since))
      );

      const [slaConfig] = await db.select().from(slaConfigs).where(
        and(eq(slaConfigs.aiEmployeeId, emp.id), eq(slaConfigs.orgId, orgId))
      );

      const targetMin = slaConfig?.targetTaskCompletionMin ?? 60;
      let slaCompliant = 0;
      const completedWithTimes = empTasks.filter(t => t.status === "completed" && t.startedAt && t.completedAt);
      for (const t of completedWithTimes) {
        const mins = (t.completedAt!.getTime() - t.startedAt!.getTime()) / 60000;
        if (mins <= targetMin) slaCompliant++;
      }

      rows.push({
        "Employee": emp.name,
        "Department": emp.department || "Unassigned",
        "Total Tasks": empTasks.length,
        "Completed Tasks": completed,
        "Completion Rate (%)": empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0,
        "Approval Rate (%)": Math.round(Number(ratingResult.avg)),
        "Total Ratings": Number(ratingResult.total),
        "CSAT Score": Number(Number(csatResult.avg).toFixed(1)),
        "Total CSAT Responses": Number(csatResult.total),
        "SLA Compliance (%)": completedWithTimes.length > 0 ? Math.round((slaCompliant / completedWithTimes.length) * 100) : 100,
      });
    }

    if (format === "csv") {
      if (rows.length === 0) {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=performance_report_${new Date().toISOString().slice(0, 10)}.csv`);
        return res.send("No data available");
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(","),
        ...rows.map(row => headers.map(h => `"${row[h]}"`).join(",")),
      ];

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=performance_report_${new Date().toISOString().slice(0, 10)}.csv`);
      res.send(csvLines.join("\n"));
    } else {
      res.json({ data: rows });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
