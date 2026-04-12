import { db } from "@workspace/db";
import { usageEvents, billingSubscriptions, billingAlerts, aiEmployees, organizations } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { type BillingDimension, getPlanLimits, ALERT_THRESHOLD_PERCENT, isUnlimited } from "./plans";
import { logger } from "../logger";
import { publishEvent } from "../websocket";

const MINUTES_TO_HOURS_DIVISOR = 60;

const COUNT_BASED_DIMENSIONS: Set<BillingDimension> = new Set([
  "ai_employees",
  "users",
]);

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

async function getCountBasedUsage(orgId: number, dimension: BillingDimension): Promise<number> {
  switch (dimension) {
    case "ai_employees": {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiEmployees)
        .where(and(eq(aiEmployees.orgId, orgId), eq(aiEmployees.status, "active")));
      return Number(result?.count || 0);
    }
    case "users": {
      const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
      return org ? 1 : 0;
    }
    default:
      return 0;
  }
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

  const results: UsageSummary[] = [];

  for (const [dim, limit] of Object.entries(limits)) {
    const dimension = dim as BillingDimension;
    let used: number;

    if (COUNT_BASED_DIMENSIONS.has(dimension)) {
      used = await getCountBasedUsage(orgId, dimension);
    } else {
      const usage = usageData.find((u) => u.dimension === dim);
      used = Number(usage?.total || 0);
      if (dimension === "voice_hours") {
        used = Math.round((used / MINUTES_TO_HOURS_DIVISOR) * 100) / 100;
      }
    }

    const unlimited = isUnlimited(limit);
    results.push({
      dimension: dim,
      used,
      limit,
      percentage: unlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0,
      isOverLimit: !unlimited && used > limit,
    });
  }

  return results;
}

export async function getDimensionUsage(
  orgId: number,
  dimension: BillingDimension,
): Promise<{ used: number; limit: number; remaining: number }> {
  const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
  const plan = sub?.plan || "trial";
  const limits = getPlanLimits(plan);
  const limit = limits[dimension] ?? 0;

  let used: number;

  if (COUNT_BASED_DIMENSIONS.has(dimension)) {
    used = await getCountBasedUsage(orgId, dimension);
  } else {
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
    used = Number(result?.total || 0);
    if (dimension === "voice_hours") {
      used = Math.round((used / MINUTES_TO_HOURS_DIVISOR) * 100) / 100;
    }
  }

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

        publishEvent(orgId, "notifications", "notification:new", {
          type: "usage_alert",
          dimension,
          percentage,
          limit,
          used,
        });

        await sendAlertNotification(orgId, dimension, percentage, used, limit);

        logger.info({ orgId, dimension, percentage }, "Usage threshold alert created");
      }
    }
  } catch (err) {
    logger.warn({ err, orgId, dimension }, "Failed to check usage threshold");
  }
}

async function sendAlertNotification(
  orgId: number,
  dimension: string,
  percentage: number,
  used: number,
  limit: number,
): Promise<void> {
  try {
    logger.info(
      { orgId, dimension, percentage, used, limit },
      `Alert notification queued: ${dimension} at ${percentage}% (${used}/${limit})`,
    );
  } catch (err) {
    logger.warn({ err, orgId, dimension }, "Failed to send alert notification");
  }
}

function getDefaultPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
