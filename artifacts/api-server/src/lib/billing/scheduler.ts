import { db } from "@workspace/db";
import { billingSubscriptions, notifications, users } from "@workspace/db";
import { eq, and, lt, isNotNull } from "drizzle-orm";
import { logger } from "../logger";
import { getUsageSummary, checkAllCountBasedLimits } from "./metering";
import { DUNNING_CONFIG, ALERT_THRESHOLD_PERCENT, isUnlimited, type BillingDimension } from "./plans";
import { publishEvent } from "../websocket";
import { sendEmail } from "../email";

const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
const DUNNING_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

let monitorTimer: ReturnType<typeof setInterval> | null = null;
let dunningTimer: ReturnType<typeof setInterval> | null = null;

export function startBillingScheduler(): void {
  monitorTimer = setInterval(runAllocationMonitor, MONITOR_INTERVAL_MS);
  dunningTimer = setInterval(runDunningSchedule, DUNNING_CHECK_INTERVAL_MS);
  logger.info("Billing scheduler started (allocation monitor every 1h, dunning check every 6h)");

  setTimeout(runAllocationMonitor, 30_000);
}

export function stopBillingScheduler(): void {
  if (monitorTimer) clearInterval(monitorTimer);
  if (dunningTimer) clearInterval(dunningTimer);
  monitorTimer = null;
  dunningTimer = null;
}

async function runAllocationMonitor(): Promise<void> {
  try {
    const subs = await db.select({ orgId: billingSubscriptions.orgId, plan: billingSubscriptions.plan, status: billingSubscriptions.status })
      .from(billingSubscriptions)
      .where(eq(billingSubscriptions.status, "active"));

    let alertCount = 0;

    for (const sub of subs) {
      try {
        await checkAllCountBasedLimits(sub.orgId);

        const summary = await getUsageSummary(sub.orgId);
        for (const dim of summary) {
          if (isUnlimited(dim.limit)) continue;
          const percentage = dim.limit > 0 ? Math.round((dim.used / dim.limit) * 100) : 0;
          if (percentage >= ALERT_THRESHOLD_PERCENT) {
            alertCount++;
            await persistAndNotifyAlert(sub.orgId, dim.dimension as BillingDimension, percentage, dim.used, dim.limit);
          }
        }
      } catch (err) {
        logger.warn({ err, orgId: sub.orgId }, "Allocation monitor: error checking org");
      }
    }

    logger.info({ orgsChecked: subs.length, alertsTriggered: alertCount }, "Allocation monitor completed");
  } catch (err) {
    logger.error({ err }, "Allocation monitor failed");
  }
}

async function persistAndNotifyAlert(
  orgId: number,
  dimension: BillingDimension,
  percentage: number,
  used: number,
  limit: number,
): Promise<void> {
  const dimensionLabel = dimension.replace(/_/g, " ");
  const title = `Usage alert: ${dimensionLabel} at ${percentage}%`;
  const message = `Your organization has used ${used} of ${limit} ${dimensionLabel} (${percentage}%). Consider upgrading your plan.`;

  const orgUsers = await db.select({ id: users.id, email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.orgId, orgId));

  for (const user of orgUsers) {
    await db.insert(notifications).values({
      orgId,
      userId: user.id,
      type: "usage_alert_periodic",
      title,
      message,
      data: { dimension, percentage, used, limit, upgradeUrl: "/billing", source: "scheduler" },
    });
  }

  if (orgUsers.length > 0) {
    await sendEmail({
      to: orgUsers[0].email,
      subject: `NexsusHR: ${dimensionLabel} at ${percentage}% — periodic check`,
      text: `Hi ${orgUsers[0].firstName || "there"},\n\n${message}\n\nVisit your billing page to manage your subscription.\n\n— NexsusHR Team`,
    });
  }

  publishEvent(orgId, "billing", "billing:alert_email", {
    dimension,
    percentage,
    source: "scheduler",
  });
}

async function runDunningSchedule(): Promise<void> {
  try {
    const pastDueSubs = await db.select()
      .from(billingSubscriptions)
      .where(and(
        eq(billingSubscriptions.status, "past_due"),
        isNotNull(billingSubscriptions.graceEndsAt),
      ));

    let processed = 0;

    for (const sub of pastDueSubs) {
      try {
        const failCount = sub.failedPaymentCount || 0;
        const now = new Date();

        if (sub.graceEndsAt && now > sub.graceEndsAt) {
          await db.update(billingSubscriptions).set({
            status: "suspended",
            suspendedAt: now,
            updatedAt: now,
          }).where(eq(billingSubscriptions.orgId, sub.orgId));

          const orgUsers = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.orgId, sub.orgId));
          for (const user of orgUsers) {
            await db.insert(notifications).values({
              orgId: sub.orgId,
              userId: user.id,
              type: "subscription_suspended",
              title: "Subscription Suspended",
              message: "Your subscription has been suspended due to repeated payment failures. Please update your payment method.",
              data: { failCount, upgradeUrl: "/billing" },
            });
          }

          publishEvent(sub.orgId, "billing", "billing:payment_failed", {
            type: "suspended",
            failCount,
          });

          logger.warn({ orgId: sub.orgId, failCount }, "Subscription suspended: grace period expired");
          processed++;
          continue;
        }

        const scheduleDays = DUNNING_CONFIG.retryScheduleDays;
        const daysSinceFirstFailure = sub.graceEndsAt
          ? Math.floor((now.getTime() - (sub.graceEndsAt.getTime() - DUNNING_CONFIG.gracePeriodDays * 86400000)) / 86400000)
          : 0;

        const currentRetryStep = scheduleDays.findIndex(d => d > daysSinceFirstFailure);
        const nextRetryDay = currentRetryStep >= 0 ? scheduleDays[currentRetryStep] : null;

        if (nextRetryDay !== null && daysSinceFirstFailure >= (scheduleDays[currentRetryStep - 1] ?? 0)) {
          const orgUsers = await db.select({ id: users.id, email: users.email, firstName: users.firstName })
            .from(users)
            .where(eq(users.orgId, sub.orgId));

          for (const user of orgUsers) {
            await db.insert(notifications).values({
              orgId: sub.orgId,
              userId: user.id,
              type: "payment_retry_reminder",
              title: "Payment Retry Scheduled",
              message: `Payment retry attempt ${failCount + 1} is scheduled. Please update your payment method to avoid service interruption.`,
              data: { failCount, nextRetryDay, upgradeUrl: "/billing" },
            });
          }

          if (orgUsers.length > 0) {
            await sendEmail({
              to: orgUsers[0].email,
              subject: `NexsusHR: Payment retry scheduled — action needed`,
              text: `Hi ${orgUsers[0].firstName || "there"},\n\nWe were unable to process your payment. Retry attempt ${failCount + 1} is scheduled. Please update your payment method to avoid service interruption.\n\nVisit your billing page to update your payment method.\n\n— NexsusHR Team`,
            });
          }

          processed++;
        }
      } catch (err) {
        logger.warn({ err, orgId: sub.orgId }, "Dunning check: error processing sub");
      }
    }

    logger.info({ subsChecked: pastDueSubs.length, processed }, "Dunning schedule check completed");
  } catch (err) {
    logger.error({ err }, "Dunning schedule check failed");
  }
}
