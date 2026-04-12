import { pgTable, text, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";
import { tasks } from "./tasks";

export const taskAssignments = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  status: text("status").default("queued").notNull(),
  routingScore: real("routing_score"),
  routingFactors: jsonb("routing_factors"),
  slaDeadline: timestamp("sla_deadline"),
  slaStatus: text("sla_status").default("on_track"),
  currentPhase: text("current_phase"),
  phaseProgress: integer("phase_progress").default(0),
  checkpoints: jsonb("checkpoints"),
  stallDetectedAt: timestamp("stall_detected_at"),
  escalationLevel: integer("escalation_level").default(0),
  capacityReserved: integer("capacity_reserved").default(1),
  executionPhases: jsonb("execution_phases"),
  transitionHistory: jsonb("transition_history").default([]),
  result: jsonb("result"),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  pausedAt: timestamp("paused_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;
export type TaskAssignment = typeof taskAssignments.$inferSelect;
