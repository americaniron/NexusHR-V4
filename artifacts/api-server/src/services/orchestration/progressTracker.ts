import { db } from "@workspace/db";
import { taskAssignments } from "@workspace/db/schema";
import { eq, and, sql, isNull, lt } from "drizzle-orm";
import { AppError } from "../../middlewares/errorHandler";

interface ProgressUpdate {
  currentPhase?: string;
  phaseProgress?: number;
  checkpoint?: { name: string; data?: unknown };
}

interface ProgressSnapshot {
  assignmentId: number;
  taskId: number;
  aiEmployeeId: number;
  status: string;
  currentPhase: string | null;
  phaseProgress: number;
  executionPhases: string[];
  completedPhases: string[];
  checkpoints: Array<{ name: string; timestamp: string; data?: unknown }>;
  elapsedMs: number;
  stallDetected: boolean;
  stallDurationMs: number | null;
  slaStatus: string | null;
  slaDeadline: Date | null;
  slaRemainingMs: number | null;
}

interface StallAlert {
  assignmentId: number;
  taskId: number;
  aiEmployeeId: number;
  stallDurationMs: number;
  lastUpdatedAt: Date;
  escalationLevel: number;
}

export async function updateProgress(
  assignmentId: number,
  orgId: number,
  update: ProgressUpdate
) {
  const [assignment] = await db
    .select()
    .from(taskAssignments)
    .where(and(eq(taskAssignments.id, assignmentId), eq(taskAssignments.orgId, orgId)));

  if (!assignment) {
    throw AppError.notFound(`Assignment ${assignmentId} not found`);
  }

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
    stallDetectedAt: null,
  };

  if (update.currentPhase !== undefined) {
    updates.currentPhase = update.currentPhase;
  }

  if (update.phaseProgress !== undefined) {
    updates.phaseProgress = Math.min(100, Math.max(0, update.phaseProgress));
  }

  if (update.checkpoint) {
    const existing = (assignment.checkpoints as Array<{ name: string; timestamp: string; data?: unknown }>) || [];
    existing.push({
      name: update.checkpoint.name,
      timestamp: new Date().toISOString(),
      data: update.checkpoint.data,
    });
    updates.checkpoints = existing;
  }

  const phases = (assignment.executionPhases as string[]) || [];
  const currentIdx = update.currentPhase ? phases.indexOf(update.currentPhase) : -1;
  if (currentIdx >= 0 && update.phaseProgress === 100 && currentIdx < phases.length - 1) {
    updates.currentPhase = phases[currentIdx + 1];
    updates.phaseProgress = 0;
  }

  const [updated] = await db
    .update(taskAssignments)
    .set(updates)
    .where(eq(taskAssignments.id, assignmentId))
    .returning();

  return updated;
}

export async function getProgressSnapshot(
  assignmentId: number,
  orgId: number
): Promise<ProgressSnapshot | null> {
  const [assignment] = await db
    .select()
    .from(taskAssignments)
    .where(and(eq(taskAssignments.id, assignmentId), eq(taskAssignments.orgId, orgId)));

  if (!assignment) return null;

  const phases = (assignment.executionPhases as string[]) || [];
  const currentPhase = assignment.currentPhase;
  const currentIdx = currentPhase ? phases.indexOf(currentPhase) : -1;
  const completedPhases = currentIdx > 0 ? phases.slice(0, currentIdx) : [];

  const startTime = assignment.startedAt || assignment.createdAt;
  const elapsedMs = Date.now() - new Date(startTime).getTime();

  const stallDetected = !!assignment.stallDetectedAt;
  const stallDurationMs = stallDetected
    ? Date.now() - new Date(assignment.stallDetectedAt!).getTime()
    : null;

  let slaRemainingMs: number | null = null;
  let slaStatus = assignment.slaStatus;
  if (assignment.slaDeadline) {
    slaRemainingMs = new Date(assignment.slaDeadline).getTime() - Date.now();
    if (slaRemainingMs < 0) slaStatus = "breached";
    else if (slaRemainingMs < 3600000) slaStatus = "at_risk";
  }

  return {
    assignmentId: assignment.id,
    taskId: assignment.taskId,
    aiEmployeeId: assignment.aiEmployeeId,
    status: assignment.status,
    currentPhase,
    phaseProgress: assignment.phaseProgress || 0,
    executionPhases: phases,
    completedPhases,
    checkpoints: (assignment.checkpoints as Array<{ name: string; timestamp: string; data?: unknown }>) || [],
    elapsedMs,
    stallDetected,
    stallDurationMs,
    slaStatus,
    slaDeadline: assignment.slaDeadline,
    slaRemainingMs,
  };
}

export async function detectStalls(
  orgId: number,
  stallThresholdMs: number = 30 * 60 * 1000
): Promise<StallAlert[]> {
  const cutoff = new Date(Date.now() - stallThresholdMs);

  const stalled = await db
    .select()
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.orgId, orgId),
      sql`${taskAssignments.status} IN ('in_progress', 'accepted')`,
      lt(taskAssignments.updatedAt, cutoff),
      isNull(taskAssignments.stallDetectedAt)
    ));

  const alerts: StallAlert[] = [];

  for (const assignment of stalled) {
    await db.update(taskAssignments).set({
      stallDetectedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(taskAssignments.id, assignment.id));

    alerts.push({
      assignmentId: assignment.id,
      taskId: assignment.taskId,
      aiEmployeeId: assignment.aiEmployeeId,
      stallDurationMs: Date.now() - new Date(assignment.updatedAt).getTime(),
      lastUpdatedAt: assignment.updatedAt,
      escalationLevel: assignment.escalationLevel || 0,
    });
  }

  return alerts;
}

export async function getActiveAssignmentProgress(orgId: number) {
  const active = await db
    .select()
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.orgId, orgId),
      sql`${taskAssignments.status} IN ('queued', 'accepted', 'in_progress', 'paused', 'waiting_dependency')`
    ));

  return active.map(a => {
    const phases = (a.executionPhases as string[]) || [];
    const currentIdx = a.currentPhase ? phases.indexOf(a.currentPhase) : 0;
    const overallProgress = phases.length > 0
      ? Math.round(((currentIdx * 100 + (a.phaseProgress || 0)) / (phases.length * 100)) * 100)
      : a.phaseProgress || 0;

    return {
      assignmentId: a.id,
      taskId: a.taskId,
      aiEmployeeId: a.aiEmployeeId,
      status: a.status,
      currentPhase: a.currentPhase,
      phaseProgress: a.phaseProgress || 0,
      overallProgress,
      stallDetected: !!a.stallDetectedAt,
      slaStatus: a.slaStatus,
    };
  });
}
