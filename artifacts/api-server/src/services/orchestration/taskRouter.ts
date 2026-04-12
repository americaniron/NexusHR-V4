import { db } from "@workspace/db";
import { aiEmployees, aiEmployeeRoles, tasks, taskAssignments } from "@workspace/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";

interface RoutingCandidate {
  employeeId: number;
  employeeName: string;
  roleId: number;
  roleTitle: string;
  skillsTags: string[];
  department: string | null;
  status: string;
  currentLoad: number;
  maxConcurrent: number;
  successRate: number;
  totalCompleted: number;
  score: number;
  factors: {
    skillMatch: number;
    capacity: number;
    performance: number;
  };
}

interface RoutingRequest {
  orgId: number;
  taskTitle: string;
  taskDescription?: string | null;
  taskCategory?: string | null;
  requiredSkills?: string[];
  preferredDepartment?: string;
  excludeEmployeeIds?: number[];
}

interface RoutingResult {
  selectedEmployee: RoutingCandidate | null;
  candidates: RoutingCandidate[];
  reasoning: string;
}

const MAX_CONCURRENT_TASKS = 5;

const WEIGHTS = {
  skillMatch: 0.45,
  capacity: 0.30,
  performance: 0.25,
};

function computeSkillMatch(
  taskTitle: string,
  taskDescription: string | null | undefined,
  taskCategory: string | null | undefined,
  requiredSkills: string[],
  roleTitle: string,
  skillsTags: string[],
  roleDepartment: string,
  roleCategory: string
): number {
  const taskText = `${taskTitle} ${taskDescription || ""} ${taskCategory || ""}`.toLowerCase();
  const roleText = `${roleTitle} ${roleDepartment} ${roleCategory}`.toLowerCase();

  let matchCount = 0;
  let totalTerms = 0;

  const taskTerms = taskText.split(/\s+/).filter(t => t.length > 3);
  const roleTerms = new Set(roleText.split(/\s+/).filter(t => t.length > 3));
  const skillSet = new Set(skillsTags.map(s => s.toLowerCase()));

  for (const term of taskTerms) {
    totalTerms++;
    if (roleTerms.has(term) || [...skillSet].some(s => s.includes(term) || term.includes(s))) {
      matchCount++;
    }
  }

  let termScore = totalTerms > 0 ? matchCount / totalTerms : 0;

  if (requiredSkills.length > 0) {
    const reqLower = requiredSkills.map(s => s.toLowerCase());
    let skillHits = 0;
    for (const req of reqLower) {
      if ([...skillSet].some(s => s.includes(req) || req.includes(s))) {
        skillHits++;
      }
    }
    const skillScore = skillHits / reqLower.length;
    termScore = termScore * 0.5 + skillScore * 0.5;
  }

  if (taskCategory && roleCategory.toLowerCase().includes(taskCategory.toLowerCase())) {
    termScore = Math.min(1, termScore + 0.3);
  }

  return Math.min(1, Math.max(0, termScore));
}

function computeCapacityScore(currentLoad: number, maxConcurrent: number): number {
  if (currentLoad >= maxConcurrent) return 0;
  return 1 - (currentLoad / maxConcurrent);
}

function computePerformanceScore(successRate: number, totalCompleted: number): number {
  if (totalCompleted === 0) return 0.5;
  const confidenceMultiplier = Math.min(1, totalCompleted / 10);
  return successRate * confidenceMultiplier + 0.5 * (1 - confidenceMultiplier);
}

export async function routeTask(request: RoutingRequest): Promise<RoutingResult> {
  const { orgId, taskTitle, taskDescription, taskCategory, requiredSkills = [], preferredDepartment, excludeEmployeeIds = [] } = request;

  const employeesWithRoles = await db
    .select({
      employeeId: aiEmployees.id,
      employeeName: aiEmployees.name,
      employeeStatus: aiEmployees.status,
      employeeDepartment: aiEmployees.department,
      roleId: aiEmployeeRoles.id,
      roleTitle: aiEmployeeRoles.title,
      roleDepartment: aiEmployeeRoles.department,
      roleCategory: aiEmployeeRoles.category,
      skillsTags: aiEmployeeRoles.skillsTags,
    })
    .from(aiEmployees)
    .innerJoin(aiEmployeeRoles, eq(aiEmployees.roleId, aiEmployeeRoles.id))
    .where(and(
      eq(aiEmployees.orgId, orgId),
      eq(aiEmployees.status, "active")
    ));

  if (employeesWithRoles.length === 0) {
    return { selectedEmployee: null, candidates: [], reasoning: "No active AI employees found in organization" };
  }

  let filtered = employeesWithRoles.filter(e => !excludeEmployeeIds.includes(e.employeeId));
  if (filtered.length === 0) {
    return { selectedEmployee: null, candidates: [], reasoning: "All eligible employees excluded" };
  }

  const loadCounts = await db
    .select({
      aiEmployeeId: taskAssignments.aiEmployeeId,
      activeCount: sql<number>`count(*)`,
    })
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.orgId, orgId),
      sql`${taskAssignments.status} IN ('queued', 'accepted', 'in_progress', 'paused')`
    ))
    .groupBy(taskAssignments.aiEmployeeId);

  const loadMap = new Map<number, number>();
  for (const lc of loadCounts) {
    loadMap.set(lc.aiEmployeeId, Number(lc.activeCount));
  }

  const perfStats = await db
    .select({
      aiEmployeeId: taskAssignments.aiEmployeeId,
      total: sql<number>`count(*)`,
      succeeded: sql<number>`count(*) filter (where ${taskAssignments.status} = 'completed')`,
    })
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.orgId, orgId),
      sql`${taskAssignments.status} IN ('completed', 'failed')`
    ))
    .groupBy(taskAssignments.aiEmployeeId);

  const perfMap = new Map<number, { successRate: number; totalCompleted: number }>();
  for (const p of perfStats) {
    const total = Number(p.total);
    perfMap.set(p.aiEmployeeId, {
      successRate: total > 0 ? Number(p.succeeded) / total : 0,
      totalCompleted: total,
    });
  }

  const candidates: RoutingCandidate[] = filtered.map(emp => {
    const currentLoad = loadMap.get(emp.employeeId) || 0;
    const perf = perfMap.get(emp.employeeId) || { successRate: 0, totalCompleted: 0 };
    const skills = (emp.skillsTags as string[]) || [];

    const skillMatch = computeSkillMatch(
      taskTitle, taskDescription, taskCategory, requiredSkills,
      emp.roleTitle, skills, emp.roleDepartment, emp.roleCategory
    );
    const capacity = computeCapacityScore(currentLoad, MAX_CONCURRENT_TASKS);
    const performance = computePerformanceScore(perf.successRate, perf.totalCompleted);

    let score = skillMatch * WEIGHTS.skillMatch + capacity * WEIGHTS.capacity + performance * WEIGHTS.performance;

    if (preferredDepartment && emp.employeeDepartment?.toLowerCase() === preferredDepartment.toLowerCase()) {
      score = Math.min(1, score + 0.1);
    }

    return {
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      roleId: emp.roleId,
      roleTitle: emp.roleTitle,
      skillsTags: skills,
      department: emp.employeeDepartment,
      status: emp.employeeStatus,
      currentLoad,
      maxConcurrent: MAX_CONCURRENT_TASKS,
      successRate: perf.successRate,
      totalCompleted: perf.totalCompleted,
      score,
      factors: { skillMatch, capacity, performance },
    };
  });

  const ranked = candidates
    .filter(c => c.factors.capacity > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return {
      selectedEmployee: null,
      candidates: candidates.sort((a, b) => b.score - a.score),
      reasoning: "All eligible employees are at capacity",
    };
  }

  const selected = ranked[0];

  return {
    selectedEmployee: selected,
    candidates: ranked,
    reasoning: `Selected ${selected.employeeName} (${selected.roleTitle}) with score ${selected.score.toFixed(3)} — skill:${selected.factors.skillMatch.toFixed(2)}, capacity:${selected.factors.capacity.toFixed(2)}, performance:${selected.factors.performance.toFixed(2)}`,
  };
}

export async function getCapabilityMap(orgId: number) {
  const employeesWithRoles = await db
    .select({
      employeeId: aiEmployees.id,
      employeeName: aiEmployees.name,
      status: aiEmployees.status,
      department: aiEmployees.department,
      roleTitle: aiEmployeeRoles.title,
      roleCategory: aiEmployeeRoles.category,
      skillsTags: aiEmployeeRoles.skillsTags,
    })
    .from(aiEmployees)
    .innerJoin(aiEmployeeRoles, eq(aiEmployees.roleId, aiEmployeeRoles.id))
    .where(eq(aiEmployees.orgId, orgId));

  const loadCounts = await db
    .select({
      aiEmployeeId: taskAssignments.aiEmployeeId,
      activeCount: sql<number>`count(*)`,
    })
    .from(taskAssignments)
    .where(and(
      eq(taskAssignments.orgId, orgId),
      sql`${taskAssignments.status} IN ('queued', 'accepted', 'in_progress', 'paused')`
    ))
    .groupBy(taskAssignments.aiEmployeeId);

  const loadMap = new Map<number, number>();
  for (const lc of loadCounts) {
    loadMap.set(lc.aiEmployeeId, Number(lc.activeCount));
  }

  return employeesWithRoles.map(emp => ({
    employeeId: emp.employeeId,
    name: emp.employeeName,
    status: emp.status,
    department: emp.department,
    roleTitle: emp.roleTitle,
    category: emp.roleCategory,
    skills: (emp.skillsTags as string[]) || [],
    currentLoad: loadMap.get(emp.employeeId) || 0,
    maxConcurrent: MAX_CONCURRENT_TASKS,
    available: emp.status === "active" && (loadMap.get(emp.employeeId) || 0) < MAX_CONCURRENT_TASKS,
  }));
}
