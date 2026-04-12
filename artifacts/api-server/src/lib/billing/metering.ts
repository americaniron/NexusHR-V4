import { db } from "@workspace/db";
import { usageEvents, billingSubscriptions, billingAlerts } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { type BillingDimension, getPlanLimits, ALERT_THRESHOLD_PERCENT, isUnlimited } from "./plans";
import { logger } from "../logger";

export interface UsageSummary {
  dimension: string;
  used: number;
  limit: number;
  percentage: number;
  isOverLimit: boolean;
}

export async function recordUsage(
  orgId: number,
  dimension: BillingDimension,
  quantity: number = 1,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.insert(usageEvents).values({
    orgId,
    dimension,
    quantity,
    metadata: metadata || null,
  });

  await checkAndAlertThreshold(orgId, dimension);
}

export async function getUsageSummary(orgId: number): Promise<UsageSummary[]> {
  const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
  const plan = sub?.plan || "trial";
  const limits = getPlanLimits(plan);
  const periodStart = sub?.currentPeriodStart || getDefaultPeriodStart();

  const usageData = await db
    .select({
      dimension: usageEvents.dimension,
      total: sql<number>`COALESCE(sum(${usageEvents.quantity}), 0)`,
    })
    .from(usageEvents)
    .where(and(eq(usageEvents.orgId, orgId), gte(usageEvents.recordedAt, periodStart)))
    .groupBy(usageEvents.dimension);

  return Object.entries(limits).map(([dim, limit]) => {
    const usage = usageData.find((u) => u.dimension === dim);
    const used = Number(usage?.total || 0);
    const unlimited = isUnlimited(limit);
    return {
      dimension: dim,
      used,
      limit,
      percentage: unlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0,
      isOverLimit: !unlimited && used > limit,
    };
  });
}

export async function getDimensionUsage(
  orgId: number,
  dimension: BillingDimension,
): Promise<{ used: number; limit: number; remaining: number }> {
  const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
  const plan = sub?.plan || "trial";
  const limits = getPlanLimits(plan);
  const limit = limits[dimension] ?? 0;
  const periodStart = sub?.currentPeriodStart || getDefaultPeriodStart();

  const [result] = await db
    .select({
      total: sql<number>`COALESCE(sum(${usageEvents.quantity}), 0)`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.orgId, orgId),
        eq(usageEvents.dimension, dimension),
        gte(usageEvents.recordedAt, periodStart),
      ),
    );

  const used = Number(result?.total || 0);
  return {
    used,
    limit,
    remaining: isUnlimited(limit) ? Infinity : Math.max(0, limit - used),
  };
}

export async function checkPlanLimit(
  orgId: number,
  dimension: BillingDimension,
  additionalQuantity: number = 1,
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
  const { used, limit, remaining } = await getDimensionUsage(orgId, dimension);
  const allowed = isUnlimited(limit) || used + additionalQuantity <= limit;
  return { allowed, used, limit, remaining };
}

async function checkAndAlertThreshold(orgId: number, dimension: BillingDimension): Promise<void> {
  try {
    const { used, limit } = await getDimensionUsage(orgId, dimension);
    if (isUnlimited(limit)) return;
    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

    if (percentage >= ALERT_THRESHOLD_PERCENT) {
      const existingAlert = await db
        .select()
        .from(billingAlerts)
        .where(
          and(
            eq(billingAlerts.orgId, orgId),
            eq(billingAlerts.dimension, dimension),
            eq(billingAlerts.thresholdPercent, ALERT_THRESHOLD_PERCENT),
            eq(billingAlerts.acknowledged, false),
          ),
        );

      if (existingAlert.length === 0) {
        await db.insert(billingAlerts).values({
          orgId,
          dimension,
          thresholdPercent: ALERT_THRESHOLD_PERCENT,
          currentPercent: percentage,
          planLimit: limit,
          currentUsage: used,
        });
        logger.info({ orgId, dimension, percentage }, "Usage threshold alert created");
      }
    }
  } catch (err) {
    logger.warn({ err, orgId, dimension }, "Failed to check usage threshold");
  }
}

function getDefaultPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
