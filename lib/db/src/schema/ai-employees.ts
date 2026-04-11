import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
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
});

export const insertAiEmployeeSchema = createInsertSchema(aiEmployees).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiEmployee = z.infer<typeof insertAiEmployeeSchema>;
export type AiEmployee = typeof aiEmployees.$inferSelect;
