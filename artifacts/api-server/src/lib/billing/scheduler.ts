import { db } from "@workspace/db";
import { billingSubscriptions, billingAlerts, notifications, users } from "@workspace/db";
import { eq, and, lt, lte, gte, isNotNull } from "drizzle-orm";
import { logger } from "../logger";
import { getUsageSummary, checkAllCountBasedLimits } from "./metering";
import { DUNNING_CONFIG, ALERT_THRESHOLD_PERCENT, TRIAL_DATA_RETENTION_DAYS, isUnlimited, type BillingDimension } from "./plans";
import { publishEvent } from "../websocket";
import { sendEmail } from "../email";

const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
const DUNNING_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

let monitorTimer: ReturnType<typeof setInterval> | null = null;
let dunningTimer: ReturnType<typeof setInterval> | null = null;
let trialTimer: ReturnType<typeof setInterval> | null = null;

export function startBillingScheduler(): void {
  monitorTimer = setInterval(runAllocationMonitor, MONITOR_INTERVAL_MS);
  dunningTimer = setInterval(runDunningSchedule, DUNNING_CHECK_INTERVAL_MS);
  trialTimer = setInterval(runTrialExpirationCheck, MONITOR_INTERVAL_MS);
  logger.info("Billing scheduler started (allocation monitor every 1h, dunning check every 6h, trial expiry every 1h)");

  setTimeout(runAllocationMonitor, 30_000);
  setTimeout(runTrialExpirationCheck, 35_000);
}

export function stopBillingScheduler(): void {
  if (monitorTimer) clearInterval(monitorTimer);
  if (dunningTimer) clearInterval(dunningTimer);
  if (trialTimer) clearInterval(trialTimer);
  monitorTimer = null;
  dunningTimer = null;
  trialTimer = null;
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
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingAlerts = await db.select({ id: billingAlerts.id })
    .from(billingAlerts)
    .where(and(
      eq(billingAlerts.orgId, orgId),
      eq(billingAlerts.dimension, dimension),
      gte(billingAlerts.createdAt, oneDayAgo),
    ))
    .limit(1);

  if (existingAlerts.length > 0) return;

  const dimensionLabel = dimension.replace(/_/g, " ");
  const title = `Usage alert: ${dimensionLabel} at ${percentage}%`;
  const message = `Your organization has used ${used} of ${limit} ${dimensionLabel} (${percentage}%). Consider upgrading your plan.`;

  await db.insert(billingAlerts).values({
    orgId,
    dimension,
    thresholdPercent: ALERT_THRESHOLD_PERCENT,
    currentPercent: percentage,
    planLimit: String(limit),
    currentUsage: String(used),
  });

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

async function runTrialExpirationCheck(): Promise<void> {
  try {
    const now = new Date();
    const expiredTrials = await db.select()
      .from(billingSubscriptions)
      .where(and(
        eq(billingSubscriptions.status, "trialing"),
        isNotNull(billingSubscriptions.trialEndsAt),
        lte(billingSubscriptions.trialEndsAt, now),
      ));

    let expired = 0;

    for (const sub of expiredTrials) {
      await db.update(billingSubscriptions)
        .set({ status: "expired", updatedAt: now })
        .where(eq(billingSubscriptions.orgId, sub.orgId));

      const orgUsers = await db.select({ id: users.id, email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.orgId, sub.orgId));

      for (const user of orgUsers) {
        await db.insert(notifications).values({
          orgId: sub.orgId,
          userId: user.id,
          type: "trial_expired",
          title: "Your Free Trial Has Ended",
          message: `Your 14-day free trial has expired. Upgrade to a paid plan to keep your AI workforce running. Your data will be retained for ${TRIAL_DATA_RETENTION_DAYS} days.`,
          data: { upgradeUrl: "/billing", dataRetentionDays: TRIAL_DATA_RETENTION_DAYS },
        });
      }

      if (orgUsers.length > 0) {
        await sendEmail({
          to: orgUsers[0].email,
          subject: "NexsusHR: Your free trial has ended — upgrade to continue",
          text: `Hi ${orgUsers[0].firstName || "there"},\n\nYour 14-day free trial has ended. Your AI professionals are paused, but your data is safe for 30 more days.\n\nUpgrade now to pick up right where you left off.\n\n— NexsusHR Team`,
        });
      }

      publishEvent(sub.orgId, "billing", "billing:trial_expired", { dataRetentionDays: TRIAL_DATA_RETENTION_DAYS });
      expired++;
    }

    if (expired > 0) {
      logger.info({ expired }, "Trial expiration check: expired trials processed");
    }
  } catch (err) {
    logger.error({ err }, "Trial expiration check failed");
  }
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
        const firstFailureTime = sub.graceEndsAt
          ? sub.graceEndsAt.getTime() - DUNNING_CONFIG.gracePeriodDays * 86400000
          : now.getTime();
        const daysSinceFirstFailure = Math.floor((now.getTime() - firstFailureTime) / 86400000);

        const currentRetryStep = scheduleDays.findIndex(d => d > daysSinceFirstFailure);
        const activeRetryDay = currentRetryStep > 0 ? scheduleDays[currentRetryStep - 1] : scheduleDays[0];

        if (daysSinceFirstFailure >= activeRetryDay) {
          const recentReminders = await db.select({ id: notifications.id })
            .from(notifications)
            .where(and(
              eq(notifications.orgId, sub.orgId),
              eq(notifications.type, "payment_retry_reminder"),
              gte(notifications.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)),
            ))
            .limit(1);

          if (recentReminders.length > 0) continue;

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
              data: { failCount, retryDay: activeRetryDay, upgradeUrl: "/billing" },
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
