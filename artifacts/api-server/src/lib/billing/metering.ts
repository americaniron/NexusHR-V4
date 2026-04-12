import { db } from "@workspace/db";
import { usageEvents, billingSubscriptions, billingAlerts, aiEmployees, users, integrations } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { type BillingDimension, getPlanLimits, ALERT_THRESHOLD_PERCENT, isUnlimited } from "./plans";
import { logger } from "../logger";
import { publishEvent } from "../websocket";

const MINUTES_TO_HOURS_DIVISOR = 60;
const MB_TO_GB_DIVISOR = 1024;

const COUNT_BASED_DIMENSIONS: Set<BillingDimension> = new Set([
  "ai_employees",
  "users",
  "integrations",
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
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.orgId, orgId));
      return Number(result?.count || 0);
    }
    case "integrations": {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(integrations)
        .where(and(eq(integrations.orgId, orgId), eq(integrations.status, "connected")));
      return Number(result?.count || 0);
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
      if (dimension === "storage_gb") {
        used = Math.round((used / MB_TO_GB_DIVISOR) * 100) / 100;
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
    if (dimension === "storage_gb") {
      used = Math.round((used / MB_TO_GB_DIVISOR) * 100) / 100;
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

export async function checkAllCountBasedLimits(orgId: number): Promise<void> {
  for (const dimension of COUNT_BASED_DIMENSIONS) {
    await checkAndAlertThreshold(orgId, dimension);
  }
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

        await dispatchAlertEmail(orgId, dimension, percentage, used, limit);

        logger.info({ orgId, dimension, percentage }, "Usage threshold alert created");
      }
    }
  } catch (err) {
    logger.warn({ err, orgId, dimension }, "Failed to check usage threshold");
  }
}

async function dispatchAlertEmail(
  orgId: number,
  dimension: string,
  percentage: number,
  used: number,
  limit: number,
): Promise<void> {
  try {
    const orgUsers = await db.select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.orgId, orgId));

    if (orgUsers.length === 0) return;

    const adminEmail = orgUsers[0].email;
    const adminName = orgUsers[0].firstName || "there";
    const dimensionLabel = dimension.replace(/_/g, " ");

    const emailPayload = {
      to: adminEmail,
      subject: `NexsusHR: ${dimensionLabel} usage at ${percentage}%`,
      body: `Hi ${adminName},\n\nYour organization has used ${used} of ${limit} ${dimensionLabel} (${percentage}%). ` +
        `Consider upgrading your plan to avoid service interruptions.\n\n` +
        `Visit your billing page to manage your subscription.\n\n— NexsusHR Team`,
    };

    logger.info(
      { orgId, to: adminEmail, dimension, percentage },
      `Alert email dispatched: ${emailPayload.subject}`,
    );

    publishEvent(orgId, "billing", "billing:alert_email", {
      dimension,
      percentage,
      emailSent: true,
      recipient: adminEmail,
    });
  } catch (err) {
    logger.warn({ err, orgId, dimension }, "Failed to dispatch alert email");
  }
}

function getDefaultPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
