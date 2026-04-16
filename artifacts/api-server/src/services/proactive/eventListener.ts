import { db } from "@workspace/db";
import { proactiveRules } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { executeProactiveRule } from "./messageGenerator";
import { checkRateLimit } from "./scheduler";

export type ProactiveEventType =
  | "task:created"
  | "task:updated"
  | "task:completed"
  | "task:failed"
  | "workflow:completed"
  | "workflow:failed"
  | "billing:alert"
  | "employee:hired"
  | "integration:connected";

interface ProactiveEvent {
  type: ProactiveEventType;
  orgId: number;
  data: Record<string, unknown>;
}

export async function handleProactiveEvent(event: ProactiveEvent): Promise<void> {
  try {
    const rules = await db
      .select()
      .from(proactiveRules)
      .where(and(
        eq(proactiveRules.orgId, event.orgId),
        eq(proactiveRules.enabled, true),
        eq(proactiveRules.type, "trigger"),
        eq(proactiveRules.triggerEvent, event.type),
      ));

    for (const rule of rules) {
      try {
        if (rule.triggerConditions) {
          const conditions = rule.triggerConditions as Record<string, unknown>;
          if (!evaluateTriggerConditions(conditions, event.data)) continue;
        }

        const rateLimitOk = await checkRateLimit(rule.id, rule.aiEmployeeId, rule.maxPerDay);
        if (!rateLimitOk) {
          logger.debug({ ruleId: rule.id }, "Proactive trigger rule rate-limited");
          continue;
        }

        await executeProactiveRule(rule, event.data);
      } catch (err) {
        logger.warn({ err, ruleId: rule.id }, "Error processing trigger rule");
      }
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, "Proactive event listener failed");
  }
}

function evaluateTriggerConditions(conditions: Record<string, unknown>, data: Record<string, unknown>): boolean {
  for (const [key, expectedValue] of Object.entries(conditions)) {
    const actualValue = data[key];

    if (typeof expectedValue === "object" && expectedValue !== null) {
      const condObj = expectedValue as Record<string, unknown>;
      if ("$in" in condObj) {
        const allowedValues = condObj.$in as unknown[];
        if (!allowedValues.includes(actualValue)) return false;
      }
      if ("$ne" in condObj) {
        if (actualValue === condObj.$ne) return false;
      }
      if ("$gt" in condObj) {
        if (typeof actualValue !== "number" || actualValue <= (condObj.$gt as number)) return false;
      }
      if ("$lt" in condObj) {
        if (typeof actualValue !== "number" || actualValue >= (condObj.$lt as number)) return false;
      }
    } else {
      if (actualValue !== expectedValue) return false;
    }
  }
  return true;
}
