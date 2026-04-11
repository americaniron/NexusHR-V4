import { Router } from "express";
import { db } from "@workspace/db";
import { billingSubscriptions, usageEvents } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";

const router = Router();

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  trial: { ai_employees: 2, voice_hours: 40, messages: 5000, workflows: 10, tasks: 2000, integrations: 3, storage_gb: 10, users: 3 },
  starter: { ai_employees: 2, voice_hours: 40, messages: 5000, workflows: 10, tasks: 2000, integrations: 3, storage_gb: 10, users: 3 },
  growth: { ai_employees: 10, voice_hours: 200, messages: 25000, workflows: 50, tasks: 15000, integrations: 7, storage_gb: 50, users: 10 },
  business: { ai_employees: 50, voice_hours: 1000, messages: 999999, workflows: 200, tasks: 100000, integrations: 999, storage_gb: 500, users: 50 },
  enterprise: { ai_employees: 999999, voice_hours: 999999, messages: 999999, workflows: 999999, tasks: 999999, integrations: 999, storage_gb: 999999, users: 999999 },
};

router.get("/billing/subscription", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(404).json({ error: "No organization" });

    let [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));

    if (!sub) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      [sub] = await db.insert(billingSubscriptions).values({
        orgId,
        plan: "trial",
        status: "trialing",
        trialEndsAt: trialEnd,
        allocations: PLAN_LIMITS.trial,
      }).returning();
    }

    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

router.get("/billing/usage", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ dimensions: [] });

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    const plan = sub?.plan || "trial";
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;

    const periodStart = sub?.currentPeriodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const usageData = await db.select({
      dimension: usageEvents.dimension,
      total: sql<number>`sum(${usageEvents.quantity})`,
    }).from(usageEvents)
      .where(and(eq(usageEvents.orgId, orgId), gte(usageEvents.recordedAt, periodStart)))
      .groupBy(usageEvents.dimension);

    const dimensions = Object.entries(limits).map(([dim, limit]) => {
      const usage = usageData.find(u => u.dimension === dim);
      const used = Number(usage?.total || 0);
      return { dimension: dim, used, limit, percentage: limit > 0 ? Math.round((used / limit) * 100) : 0 };
    });

    res.json({ dimensions });
  } catch (error) {
    res.status(500).json({ error: "Failed to get usage" });
  }
});

export default router;
