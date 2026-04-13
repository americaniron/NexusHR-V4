import { pgTable, text, serial, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployeeRoles } from "./ai-employee-roles";

export const aiEmployees = pgTable("ai_employees", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  roleId: integer("role_id").references(() => aiEmployeeRoles.id).notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  avatarConfig: jsonb("avatar_config"),
  voiceId: text("voice_id"),
  department: text("department"),
  team: text("team"),
  status: text("status").default("active").notNull(),
  personality: jsonb("personality"),
  customInstructions: text("custom_instructions"),
  memoryContext: jsonb("memory_context"),
  integrationPermissions: jsonb("integration_permissions"),
  hiredAt: timestamp("hired_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ai_employees_org_id").on(table.orgId),
  index("idx_ai_employees_status").on(table.status),
  index("idx_ai_employees_org_status").on(table.orgId, table.status),
]);

export const insertAiEmployeeSchema = createInsertSchema(aiEmployees).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiEmployee = z.infer<typeof insertAiEmployeeSchema>;
export type AiEmployee = typeof aiEmployees.$inferSelect;
