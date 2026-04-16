import { pgTable, text, serial, integer, timestamp, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";
import { conversations } from "./conversations";
import { messages } from "./conversations";
import { users } from "./users";

export const responseRatings = pgTable("response_ratings", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_response_ratings_org").on(table.orgId),
  index("idx_response_ratings_employee").on(table.aiEmployeeId),
  index("idx_response_ratings_message").on(table.messageId),
  index("idx_response_ratings_created").on(table.createdAt),
]);

export const slaConfigs = pgTable("sla_configs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  targetResponseTimeSec: integer("target_response_time_sec").default(300).notNull(),
  targetTaskCompletionMin: integer("target_task_completion_min").default(60).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sla_configs_employee").on(table.aiEmployeeId),
]);

export const csatResponses = pgTable("csat_responses", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_csat_org").on(table.orgId),
  index("idx_csat_employee").on(table.aiEmployeeId),
  index("idx_csat_created").on(table.createdAt),
]);

export const insertResponseRatingSchema = createInsertSchema(responseRatings).omit({ id: true, createdAt: true });
export type InsertResponseRating = z.infer<typeof insertResponseRatingSchema>;
export type ResponseRating = typeof responseRatings.$inferSelect;

export const insertSlaConfigSchema = createInsertSchema(slaConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSlaConfig = z.infer<typeof insertSlaConfigSchema>;
export type SlaConfig = typeof slaConfigs.$inferSelect;

export const insertCsatResponseSchema = createInsertSchema(csatResponses).omit({ id: true, createdAt: true });
export type InsertCsatResponse = z.infer<typeof insertCsatResponseSchema>;
export type CsatResponse = typeof csatResponses.$inferSelect;
