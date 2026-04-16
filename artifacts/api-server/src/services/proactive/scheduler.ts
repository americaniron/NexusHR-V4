import { db } from "@workspace/db";
import { proactiveRules, proactiveExecutions } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { executeProactiveRule } from "./messageGenerator";

const SCHEDULER_INTERVAL_MS = 60 * 1000;

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

export function startProactiveScheduler(): void {
  schedulerTimer = setInterval(evaluateScheduledRules, SCHEDULER_INTERVAL_MS);
  logger.info("Proactive scheduler started (checking every 60s)");
  setTimeout(evaluateScheduledRules, 10_000);
}

export function stopProactiveScheduler(): void {
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerTimer = null;
  logger.info("Proactive scheduler stopped");
}

function matchesCronSchedule(schedule: string, now: Date): boolean {
  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const [minutePart, hourPart, dayOfMonthPart, monthPart, dayOfWeekPart] = parts;
  const minute = now.getMinutes();
  const hour = now.getHours();
  const dayOfMonth = now.getDate();
  const month = now.getMonth() + 1;
  const dayOfWeek = now.getDay();

  return (
    matchesCronField(minutePart, minute) &&
    matchesCronField(hourPart, hour) &&
    matchesCronField(dayOfMonthPart, dayOfMonth) &&
    matchesCronField(monthPart, month) &&
    matchesCronField(dayOfWeekPart, dayOfWeek)
  );
}

function matchesCronField(field: string, value: number): boolean {
  if (field === "*") return true;

  if (field.includes("/")) {
    const [base, stepStr] = field.split("/");
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step <= 0) return false;
    const start = base === "*" ? 0 : parseInt(base, 10);
    return (value - start) % step === 0 && value >= start;
  }

  if (field.includes(",")) {
    return field.split(",").some(v => parseInt(v.trim(), 10) === value);
  }

  if (field.includes("-")) {
    const [minStr, maxStr] = field.split("-");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return value >= min && value <= max;
  }

  return parseInt(field, 10) === value;
}

async function evaluateScheduledRules(): Promise<void> {
  try {
    const rules = await db
      .select()
      .from(proactiveRules)
      .where(and(
        eq(proactiveRules.enabled, true),
        eq(proactiveRules.type, "scheduled"),
      ));

    const now = new Date();
    let fired = 0;

    for (const rule of rules) {
      try {
        if (!rule.schedule) continue;
        if (!matchesCronSchedule(rule.schedule, now)) continue;

        if (rule.lastFiredAt) {
          const minsSinceLastFire = (now.getTime() - rule.lastFiredAt.getTime()) / 60000;
          if (minsSinceLastFire < 1) continue;
        }

        const rateLimitOk = await checkRateLimit(rule.id, rule.aiEmployeeId, rule.maxPerDay);
        if (!rateLimitOk) {
          logger.debug({ ruleId: rule.id }, "Proactive rule rate-limited");
          continue;
        }

        await executeProactiveRule(rule);
        fired++;
      } catch (err) {
        logger.warn({ err, ruleId: rule.id }, "Error evaluating scheduled rule");
      }
    }

    if (fired > 0) {
      logger.info({ fired, total: rules.length }, "Proactive scheduler: rules fired");
    }
  } catch (err) {
    logger.error({ err }, "Proactive scheduler evaluation failed");
  }
}

export async function checkRateLimit(ruleId: number, aiEmployeeId: number, maxPerDay: number): Promise<boolean> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proactiveExecutions)
    .where(and(
      eq(proactiveExecutions.aiEmployeeId, aiEmployeeId),
      eq(proactiveExecutions.status, "completed"),
      gte(proactiveExecutions.executedAt, dayAgo),
    ));

  return Number(result.count) < maxPerDay;
}

export { matchesCronSchedule };
