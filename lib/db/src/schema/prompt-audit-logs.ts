import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { users } from "./users";
import { aiEmployees } from "./ai-employees";

export const promptAuditLogs = pgTable("prompt_audit_logs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  templateVersion: integer("template_version"),
  layersSummary: jsonb("layers_summary"),
  assembledPromptHash: text("assembled_prompt_hash").notNull(),
  redactedPrompt: text("redacted_prompt").notNull(),
  tokenCount: integer("token_count").notNull(),
  tokenBudget: integer("token_budget").notNull(),
  truncationApplied: jsonb("truncation_applied"),
  validationResult: jsonb("validation_result"),
  assemblyDurationMs: integer("assembly_duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptAuditLogSchema = createInsertSchema(promptAuditLogs).omit({ id: true, createdAt: true });
export type InsertPromptAuditLog = z.infer<typeof insertPromptAuditLogSchema>;
export type PromptAuditLog = typeof promptAuditLogs.$inferSelect;
