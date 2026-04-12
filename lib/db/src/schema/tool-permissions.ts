import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { toolRegistry } from "./integrations";
import { aiEmployees } from "./ai-employees";

export const toolRoles = pgTable("tool_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default([]).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const toolRoleAssignments = pgTable("tool_role_assignments", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  roleId: integer("role_id").references(() => toolRoles.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolPermissionOverrides = pgTable("tool_permission_overrides", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  toolId: integer("tool_id").references(() => toolRegistry.id).notNull(),
  allowedOperations: jsonb("allowed_operations").default([]),
  deniedOperations: jsonb("denied_operations").default([]),
  resourceRestrictions: jsonb("resource_restrictions"),
  temporalConstraints: jsonb("temporal_constraints"),
  rateLimitOverride: jsonb("rate_limit_override"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertToolRoleSchema = createInsertSchema(toolRoles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertToolRole = z.infer<typeof insertToolRoleSchema>;
export type ToolRole = typeof toolRoles.$inferSelect;

export const insertToolRoleAssignmentSchema = createInsertSchema(toolRoleAssignments).omit({ id: true, createdAt: true });
export type InsertToolRoleAssignment = z.infer<typeof insertToolRoleAssignmentSchema>;
export type ToolRoleAssignment = typeof toolRoleAssignments.$inferSelect;

export const insertToolPermissionOverrideSchema = createInsertSchema(toolPermissionOverrides).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertToolPermissionOverride = z.infer<typeof insertToolPermissionOverrideSchema>;
export type ToolPermissionOverride = typeof toolPermissionOverrides.$inferSelect;
