import { pgTable, text, serial, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";
import { users } from "./users";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  assigneeId: integer("assignee_id").references(() => aiEmployees.id),
  createdById: integer("created_by_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("queued").notNull(),
  priority: text("priority").default("medium").notNull(),
  category: text("category"),
  dueDate: timestamp("due_date"),
  deliverable: text("deliverable"),
  deliverableType: text("deliverable_type"),
  executionLog: jsonb("execution_log"),
  dependencies: jsonb("dependencies"),
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tasks_org_id").on(table.orgId),
  index("idx_tasks_assignee_id").on(table.assigneeId),
  index("idx_tasks_status").on(table.status),
  index("idx_tasks_org_status").on(table.orgId, table.status),
  index("idx_tasks_created_at").on(table.createdAt),
]);

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
