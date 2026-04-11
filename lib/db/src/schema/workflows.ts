import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { users } from "./users";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(),
  triggerType: text("trigger_type"),
  triggerConfig: jsonb("trigger_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflows.id).notNull(),
  stepOrder: integer("step_order").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config"),
  assigneeRoleId: integer("assignee_role_id"),
  conditions: jsonb("conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowInstances = pgTable("workflow_instances", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflows.id).notNull(),
  status: text("status").default("running").notNull(),
  currentStepId: integer("current_step_id").references(() => workflowSteps.id),
  stepResults: jsonb("step_results"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({ id: true, createdAt: true });
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;

export const insertWorkflowInstanceSchema = createInsertSchema(workflowInstances).omit({ id: true, startedAt: true });
export type InsertWorkflowInstance = z.infer<typeof insertWorkflowInstanceSchema>;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;
