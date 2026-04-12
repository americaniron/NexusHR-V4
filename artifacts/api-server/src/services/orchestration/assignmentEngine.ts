import { db } from "@workspace/db";
import { taskAssignments, tasks, aiEmployees } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { AppError } from "../../middlewares/errorHandler";

const MAX_CONCURRENT_TASKS = 5;

type AssignmentStatus =
  | "queued"
  | "accepted"
  | "in_progress"
  | "paused"
  | "waiting_dependency"
  | "completed"
  | "failed"
  | "escalated"
  | "cancelled";

const VALID_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  queued: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled", "escalated"],
  in_progress: ["paused", "waiting_dependency", "completed", "failed", "escalated", "cancelled"],
  paused: ["in_progress", "cancelled", "escalated"],
  waiting_dependency: ["in_progress", "cancelled", "escalated"],
  completed: [],
  failed: [],
  escalated: ["in_progress", "cancelled"],
  cancelled: [],
};

const TERMINAL_STATUSES: AssignmentStatus[] = ["completed", "failed", "cancelled"];

interface CreateAssignmentInput {
  orgId: number;
  taskId: number;
  aiEmployeeId: number;
  routingScore?: number;
  routingFactors?: Record<string, number>;
  slaDeadline?: Date;
  executionPhases?: string[];
}

export async function createAssignment(input: CreateAssignmentInput) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, input.taskId), eq(tasks.orgId, input.orgId)));
  if (!task) throw AppError.notFound("Task not found or does not belong to this organization");

  const [employee] = await db
    .select()
    .from(aiEmployees)
    .where(and(eq(aiEmployees.id, input.aiEmployeeId), eq(aiEmployees.orgId, input.orgId)));
  if (!employee) throw AppError.notFound("AI employee not found or does not belong to this organization");

  const activeAssignments = await db
    .select()
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.aiEmployeeId, input.aiEmployeeId),
      eq(taskAssignments.orgId, input.orgId),
      eq(taskAssignments.capacityReserved, 1),
      sql`${taskAssignments.status} IN ('queued', 'accepted', 'in_progress', 'paused', 'waiting_dependency')`
    ));

  if (activeAssignments.length >= MAX_CONCURRENT_TASKS) {
    throw AppError.badRequest(`AI employee has reached maximum concurrent task limit (${MAX_CONCURRENT_TASKS}). Current active: ${activeAssignments.length}`);
  }

  const [assignment] = await db.insert(taskAssignments).values({
    orgId: input.orgId,
    taskId: input.taskId,
    aiEmployeeId: input.aiEmployeeId,
    status: "queued",
    routingScore: input.routingScore ?? null,
    routingFactors: input.routingFactors ?? null,
    slaDeadline: input.slaDeadline ?? null,
    executionPhases: input.executionPhases ?? ["initialization", "processing", "validation", "delivery"],
    currentPhase: "initialization",
    phaseProgress: 0,
    checkpoints: [],
    capacityReserved: 1,
  }).returning();

  await db.update(tasks).set({
    assigneeId: input.aiEmployeeId,
    status: "queued",
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, input.taskId), eq(tasks.orgId, input.orgId)));

  return assignment;
}

export async function transitionAssignment(
  assignmentId: number,
  orgId: number,
  newStatus: AssignmentStatus,
  metadata?: { result?: unknown; escalationReason?: string }
) {
  const [assignment] = await db
    .select()
    .from(taskAssignments)
    .where(and(eq(taskAssignments.id, assignmentId), eq(taskAssignments.orgId, orgId)));

  if (!assignment) {
    throw AppError.notFound(`Assignment ${assignmentId} not found`);
  }

  const currentStatus = assignment.status as AssignmentStatus;
  const allowedNext = VALID_TRANSITIONS[currentStatus];

  if (!allowedNext || !allowedNext.includes(newStatus)) {
    throw AppError.badRequest(`Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowedNext?.join(", ") || "none"}`);
  }

  const existingHistory = (assignment.transitionHistory as Array<{ from: string; to: string; timestamp: string; metadata?: unknown }>) || [];
  const transitionEntry = {
    from: currentStatus,
    to: newStatus,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };

  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date(),
    transitionHistory: [...existingHistory, transitionEntry],
  };

  switch (newStatus) {
    case "accepted":
      updates.acceptedAt = new Date();
      break;
    case "in_progress":
      if (!assignment.startedAt) updates.startedAt = new Date();
      updates.pausedAt = null;
      break;
    case "paused":
      updates.pausedAt = new Date();
      break;
    case "completed":
      updates.completedAt = new Date();
      updates.capacityReserved = 0;
      updates.phaseProgress = 100;
      if (metadata?.result) updates.result = metadata.result;
      break;
    case "failed":
      updates.completedAt = new Date();
      updates.capacityReserved = 0;
      if (metadata?.result) updates.result = metadata.result;
      break;
    case "cancelled":
      updates.completedAt = new Date();
      updates.capacityReserved = 0;
      break;
    case "escalated":
      updates.escalationLevel = (assignment.escalationLevel || 0) + 1;
      break;
  }

  const [updated] = await db
    .update(taskAssignments)
    .set(updates)
    .where(eq(taskAssignments.id, assignmentId))
    .returning();

  const taskStatusMap: Record<string, string> = {
    queued: "queued",
    accepted: "queued",
    in_progress: "in_progress",
    paused: "in_progress",
    waiting_dependency: "in_progress",
    completed: "completed",
    failed: "failed",
    escalated: "in_progress",
    cancelled: "cancelled",
  };

  const taskUpdates: Record<string, unknown> = {
    status: taskStatusMap[newStatus] || "in_progress",
    updatedAt: new Date(),
  };
  if (newStatus === "in_progress" && !assignment.startedAt) {
    taskUpdates.startedAt = new Date();
  }
  if (TERMINAL_STATUSES.includes(newStatus)) {
    taskUpdates.completedAt = new Date();
  }

  await db.update(tasks).set(taskUpdates).where(eq(tasks.id, assignment.taskId));

  return updated;
}

export async function getAssignment(assignmentId: number, orgId: number) {
  const [assignment] = await db
    .select()
    .from(taskAssignments)
    .where(and(eq(taskAssignments.id, assignmentId), eq(taskAssignments.orgId, orgId)));
  return assignment ?? null;
}

export async function getAssignmentsForEmployee(aiEmployeeId: number, orgId: number, activeOnly = false) {
  const conditions = [eq(taskAssignments.aiEmployeeId, aiEmployeeId), eq(taskAssignments.orgId, orgId)];
  if (activeOnly) {
    conditions.push(
      eq(taskAssignments.capacityReserved, 1)
    );
  }
  return db.select().from(taskAssignments).where(and(...conditions));
}

export async function getAssignmentsForTask(taskId: number, orgId: number) {
  return db
    .select()
    .from(taskAssignments)
    .where(and(eq(taskAssignments.taskId, taskId), eq(taskAssignments.orgId, orgId)));
}

export function getValidTransitions(status: string): string[] {
  return VALID_TRANSITIONS[status as AssignmentStatus] || [];
}
