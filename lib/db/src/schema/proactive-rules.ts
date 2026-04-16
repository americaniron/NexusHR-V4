import { pgTable, text, serial, integer, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";

export const proactiveRules = pgTable("proactive_rules", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  schedule: text("schedule"),
  triggerEvent: text("trigger_event"),
  triggerConditions: jsonb("trigger_conditions"),
  actionType: text("action_type").notNull().default("send_message"),
  actionConfig: jsonb("action_config"),
  messageTemplate: text("message_template"),
  enabled: boolean("enabled").default(true).notNull(),
  maxPerDay: integer("max_per_day").default(5).notNull(),
  lastFiredAt: timestamp("last_fired_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_proactive_rules_org_id").on(table.orgId),
  index("idx_proactive_rules_employee_id").on(table.aiEmployeeId),
  index("idx_proactive_rules_enabled").on(table.enabled),
  index("idx_proactive_rules_type").on(table.type),
]);

export const proactiveExecutions = pgTable("proactive_executions", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => proactiveRules.id).notNull(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  status: text("status").notNull().default("pending"),
  triggerData: jsonb("trigger_data"),
  messageContent: text("message_content"),
  conversationId: integer("conversation_id"),
  messageId: integer("message_id"),
  error: text("error"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
}, (table) => [
  index("idx_proactive_executions_rule_id").on(table.ruleId),
  index("idx_proactive_executions_employee_id").on(table.aiEmployeeId),
  index("idx_proactive_executions_executed_at").on(table.executedAt),
]);

export const insertProactiveRuleSchema = createInsertSchema(proactiveRules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProactiveRule = z.infer<typeof insertProactiveRuleSchema>;
export type ProactiveRule = typeof proactiveRules.$inferSelect;

export const insertProactiveExecutionSchema = createInsertSchema(proactiveExecutions).omit({ id: true, executedAt: true });
export type InsertProactiveExecution = z.infer<typeof insertProactiveExecutionSchema>;
export type ProactiveExecution = typeof proactiveExecutions.$inferSelect;
