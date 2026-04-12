import { db } from "@workspace/db";
import { tasks, taskAssignments } from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { AppError } from "../../middlewares/errorHandler";
import { transitionAssignment } from "./assignmentEngine";

interface TaskDependency {
  taskId: number;
  dependsOn: number[];
}

interface DependencyGraph {
  order: number[];
  layers: number[][];
  blocked: Map<number, number[]>;
  ready: number[];
}

export function topologicalSort(deps: TaskDependency[]): DependencyGraph {
  const graph = new Map<number, number[]>();
  const inDegree = new Map<number, number>();
  const reverseGraph = new Map<number, number[]>();

  for (const dep of deps) {
    if (!graph.has(dep.taskId)) graph.set(dep.taskId, []);
    if (!inDegree.has(dep.taskId)) inDegree.set(dep.taskId, 0);

    for (const d of dep.dependsOn) {
      if (!graph.has(d)) graph.set(d, []);
      graph.get(d)!.push(dep.taskId);

      if (!reverseGraph.has(dep.taskId)) reverseGraph.set(dep.taskId, []);
      reverseGraph.get(dep.taskId)!.push(d);

      inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1);
      if (!inDegree.has(d)) inDegree.set(d, 0);
    }
  }

  const order: number[] = [];
  const layers: number[][] = [];
  const queue: number[] = [];
  const blocked = new Map<number, number[]>();

  for (const [node, degree] of inDegree) {
    if (degree === 0) queue.push(node);
  }

  while (queue.length > 0) {
    const layer = [...queue];
    layers.push(layer);
    queue.length = 0;

    for (const node of layer) {
      order.push(node);
      for (const neighbor of graph.get(node) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }
  }

  for (const [node, degree] of inDegree) {
    if (degree > 0) {
      blocked.set(node, reverseGraph.get(node) || []);
    }
  }

  const ready = layers.length > 0 ? layers[0] : [];

  return { order, layers, blocked, ready };
}

export async function resolveTaskDependencies(orgId: number, taskIds: number[]): Promise<DependencyGraph> {
  if (taskIds.length === 0) {
    return { order: [], layers: [], blocked: new Map(), ready: [] };
  }

  const taskRows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.orgId, orgId), inArray(tasks.id, taskIds)));

  const deps: TaskDependency[] = taskRows.map(t => ({
    taskId: t.id,
    dependsOn: Array.isArray(t.dependencies) ? (t.dependencies as number[]) : [],
  }));

  return topologicalSort(deps);
}

export async function getBlockingStatus(taskId: number, orgId: number): Promise<{
  isBlocked: boolean;
  blockedBy: Array<{ taskId: number; title: string; status: string }>;
  blockers: Array<{ taskId: number; title: string; status: string }>;
}> {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.orgId, orgId)));

  if (!task) throw AppError.notFound(`Task ${taskId} not found`);

  const dependsOn = Array.isArray(task.dependencies) ? (task.dependencies as number[]) : [];

  let blockedBy: Array<{ taskId: number; title: string; status: string }> = [];
  if (dependsOn.length > 0) {
    const depTasks = await db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status })
      .from(tasks)
      .where(and(eq(tasks.orgId, orgId), inArray(tasks.id, dependsOn)));

    blockedBy = depTasks
      .filter(d => d.status !== "completed")
      .map(d => ({ taskId: d.id, title: d.title, status: d.status }));
  }

  const allOrgTasks = await db
    .select({ id: tasks.id, title: tasks.title, status: tasks.status, dependencies: tasks.dependencies })
    .from(tasks)
    .where(eq(tasks.orgId, orgId));

  const blockers = allOrgTasks
    .filter(t => {
      const deps = Array.isArray(t.dependencies) ? (t.dependencies as number[]) : [];
      return deps.includes(taskId) && t.status !== "completed";
    })
    .map(t => ({ taskId: t.id, title: t.title, status: t.status }));

  return {
    isBlocked: blockedBy.length > 0,
    blockedBy,
    blockers,
  };
}

export async function unblockDependents(taskId: number, orgId: number): Promise<number[]> {
  const allOrgTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.orgId, orgId));

  const unblockedIds: number[] = [];

  for (const task of allOrgTasks) {
    const deps = Array.isArray(task.dependencies) ? (task.dependencies as number[]) : [];
    if (!deps.includes(taskId)) continue;

    const otherDeps = deps.filter(d => d !== taskId);
    if (otherDeps.length === 0) {
      unblockedIds.push(task.id);
      continue;
    }

    const depTasks = await db
      .select({ id: tasks.id, status: tasks.status })
      .from(tasks)
      .where(and(eq(tasks.orgId, orgId), inArray(tasks.id, otherDeps)));

    const allComplete = depTasks.every(d => d.status === "completed");
    if (allComplete) {
      unblockedIds.push(task.id);
    }
  }

  for (const id of unblockedIds) {
    const [assignment] = await db
      .select()
      .from(taskAssignments)
      .where(and(
        eq(taskAssignments.taskId, id),
        eq(taskAssignments.orgId, orgId),
        eq(taskAssignments.status, "waiting_dependency")
      ));

    if (assignment) {
      await transitionAssignment(assignment.id, orgId, "in_progress", {
        result: { reason: `Dependencies resolved for task ${id}` },
      });
    }
  }

  return unblockedIds;
}
