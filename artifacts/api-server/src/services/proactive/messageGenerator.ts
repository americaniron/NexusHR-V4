import { db } from "@workspace/db";
import {
  proactiveRules,
  proactiveExecutions,
  aiEmployees,
  aiEmployeeRoles,
  conversations,
  messages,
  users,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { chatCompletion } from "../../lib/ai";
import { publishEvent } from "../../lib/websocket";
import type { ProactiveRule } from "@workspace/db";

export async function executeProactiveRule(
  rule: ProactiveRule,
  triggerData?: Record<string, unknown>,
): Promise<void> {
  const [employee] = await db
    .select()
    .from(aiEmployees)
    .where(eq(aiEmployees.id, rule.aiEmployeeId));

  if (!employee || employee.status !== "active") {
    logger.debug({ ruleId: rule.id }, "Skipping proactive rule: employee inactive");
    return;
  }

  const [role] = await db
    .select()
    .from(aiEmployeeRoles)
    .where(eq(aiEmployeeRoles.id, employee.roleId));

  const orgUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.orgId, rule.orgId))
    .limit(1);

  if (orgUsers.length === 0) {
    logger.debug({ ruleId: rule.id }, "Skipping proactive rule: no users in org");
    return;
  }

  const userId = orgUsers[0].id;

  let [conv] = await db
    .select()
    .from(conversations)
    .where(and(
      eq(conversations.orgId, rule.orgId),
      eq(conversations.userId, userId),
      eq(conversations.aiEmployeeId, rule.aiEmployeeId),
      eq(conversations.status, "active"),
    ))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(1);

  if (!conv) {
    [conv] = await db
      .insert(conversations)
      .values({
        orgId: rule.orgId,
        userId,
        aiEmployeeId: rule.aiEmployeeId,
        title: `Proactive: ${rule.name}`,
        status: "active",
      })
      .returning();
  }

  let messageContent: string;

  try {
    messageContent = await generateProactiveMessage(rule, employee, role, triggerData);
  } catch (err) {
    await db.insert(proactiveExecutions).values({
      ruleId: rule.id,
      orgId: rule.orgId,
      aiEmployeeId: rule.aiEmployeeId,
      status: "failed",
      triggerData: triggerData || null,
      error: err instanceof Error ? err.message : "Message generation failed",
    });
    logger.error({ err, ruleId: rule.id }, "Proactive message generation failed");
    return;
  }

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId: conv.id,
      role: "assistant",
      content: messageContent,
      messageType: "proactive",
      metadata: {
        proactive: true,
        proactiveRuleId: rule.id,
        proactiveRuleName: rule.name,
        proactiveType: rule.type,
        triggerEvent: rule.triggerEvent,
        triggerData: triggerData || null,
      },
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conv.id));

  await db.insert(proactiveExecutions).values({
    ruleId: rule.id,
    orgId: rule.orgId,
    aiEmployeeId: rule.aiEmployeeId,
    status: "completed",
    triggerData: triggerData || null,
    messageContent,
    conversationId: conv.id,
    messageId: msg.id,
  });

  await db
    .update(proactiveRules)
    .set({ lastFiredAt: new Date(), updatedAt: new Date() })
    .where(eq(proactiveRules.id, rule.id));

  publishEvent(rule.orgId, "conversations", "conversation:message", {
    conversationId: conv.id,
    aiMessage: msg,
    proactive: true,
    ruleName: rule.name,
  });

  publishEvent(rule.orgId, "notifications", "notification:new", {
    type: "proactive_message",
    title: `${employee.name} has an update`,
    message: messageContent.slice(0, 200),
    aiEmployeeId: employee.id,
    conversationId: conv.id,
  });

  logger.info(
    { ruleId: rule.id, employeeId: employee.id, conversationId: conv.id, messageId: msg.id },
    "Proactive rule executed successfully",
  );
}

async function generateProactiveMessage(
  rule: ProactiveRule,
  employee: typeof aiEmployees.$inferSelect,
  role: typeof aiEmployeeRoles.$inferSelect | undefined,
  triggerData?: Record<string, unknown>,
): Promise<string> {
  const contextParts: string[] = [];

  if (rule.messageTemplate) {
    contextParts.push(`Message template/guidance: ${rule.messageTemplate}`);
  }
  if (rule.description) {
    contextParts.push(`Rule purpose: ${rule.description}`);
  }
  if (triggerData) {
    contextParts.push(`Trigger context: ${JSON.stringify(triggerData)}`);
  }

  const systemPrompt = `You are ${employee.name}, a ${role?.title || "professional AI employee"}.
${role?.description || "You help with professional tasks."}
You are proactively reaching out to the user — they did not initiate this message.
Your goal: ${rule.name}
${contextParts.join("\n")}

Guidelines:
- Be helpful and concise
- Explain why you are reaching out proactively
- Provide actionable information or recommendations
- Keep the tone professional but friendly
- Do not apologize for reaching out — this is part of your role`;

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `Generate a proactive message for the rule: "${rule.name}". ${
        rule.type === "scheduled" ? `This is a scheduled check (${rule.schedule}).` : ""
      }${
        rule.type === "trigger" && rule.triggerEvent ? `This was triggered by: ${rule.triggerEvent}.` : ""
      }`,
    },
  ];

  return chatCompletion(chatMessages, { maxTokens: 500 });
}
