import { pgTable, text, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiEmployeeRoles = pgTable("ai_employee_roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  department: text("department").notNull(),
  category: text("category").notNull(),
  industry: text("industry").notNull(),
  reportsTo: text("reports_to"),
  seniorityLevel: text("seniority_level").notNull(),
  description: text("description").notNull(),
  coreResponsibilities: jsonb("core_responsibilities").notNull(),
  tasks: jsonb("tasks").notNull(),
  toolsAndIntegrations: jsonb("tools_and_integrations"),
  dataAccessPermissions: jsonb("data_access_permissions"),
  communicationCapabilities: jsonb("communication_capabilities"),
  exampleWorkflows: jsonb("example_workflows"),
  performanceMetrics: jsonb("performance_metrics"),
  useCases: jsonb("use_cases"),
  personalityDefaults: jsonb("personality_defaults"),
  complianceMetadata: jsonb("compliance_metadata"),
  skillsTags: jsonb("skills_tags"),
  priceMonthly: integer("price_monthly").notNull(),
  avatarUrl: text("avatar_url"),
  rating: real("rating").default(4.5),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiEmployeeRoleSchema = createInsertSchema(aiEmployeeRoles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiEmployeeRole = z.infer<typeof insertAiEmployeeRoleSchema>;
export type AiEmployeeRole = typeof aiEmployeeRoles.$inferSelect;
