import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";

export const toolRegistry = pgTable("tool_registry", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  provider: text("provider"),
  authType: text("auth_type").notNull(),
  requiredScopes: jsonb("required_scopes"),
  capabilities: jsonb("capabilities"),
  rateLimits: jsonb("rate_limits"),
  healthEndpoint: text("health_endpoint"),
  documentationUrl: text("documentation_url"),
  iconUrl: text("icon_url"),
  isActive: integer("is_active").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  toolId: integer("tool_id").references(() => toolRegistry.id).notNull(),
  status: text("status").default("disconnected").notNull(),
  connectedScopes: jsonb("connected_scopes"),
  connectionConfig: jsonb("connection_config"),
  connectedAt: timestamp("connected_at"),
  disconnectedAt: timestamp("disconnected_at"),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: text("health_status").default("unknown"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const toolPermissions = pgTable("tool_permissions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  toolId: integer("tool_id").references(() => toolRegistry.id).notNull(),
  permissionLevel: text("permission_level").default("read").notNull(),
  allowedOperations: jsonb("allowed_operations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolAuditLogs = pgTable("tool_audit_logs", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id),
  toolId: integer("tool_id").references(() => toolRegistry.id).notNull(),
  operation: text("operation").notNull(),
  parameters: jsonb("parameters"),
  result: text("result"),
  resultData: jsonb("result_data"),
  permissionDecision: text("permission_decision"),
  permissionDetails: jsonb("permission_details"),
  executionDurationMs: integer("execution_duration_ms"),
  errorMessage: text("error_message"),
  requestId: text("request_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertToolRegistrySchema = createInsertSchema(toolRegistry).omit({ id: true, createdAt: true });
export type InsertToolRegistry = z.infer<typeof insertToolRegistrySchema>;
export type ToolRegistry = typeof toolRegistry.$inferSelect;

export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true });
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export const insertToolPermissionSchema = createInsertSchema(toolPermissions).omit({ id: true, createdAt: true });
export type InsertToolPermission = z.infer<typeof insertToolPermissionSchema>;
export type ToolPermission = typeof toolPermissions.$inferSelect;

export const insertToolAuditLogSchema = createInsertSchema(toolAuditLogs).omit({ id: true, createdAt: true });
export type InsertToolAuditLog = z.infer<typeof insertToolAuditLogSchema>;
export type ToolAuditLog = typeof toolAuditLogs.$inferSelect;
