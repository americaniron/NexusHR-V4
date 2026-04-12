import { db } from "@workspace/db";
import { workflows, workflowSteps, workflowInstances, aiEmployees, aiEmployeeRoles } from "@workspace/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { routeTask } from "./taskRouter";
import { createAssignment, transitionAssignment } from "./assignmentEngine";
import { AppError } from "../../middlewares/errorHandler";

interface StepResult {
  stepId: number;
  stepName: string;
  stepOrder: number;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  assignmentId?: number;
  aiEmployeeId?: number;
  aiEmployeeName?: string;
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

interface WorkflowExecutionResult {
  instanceId: number;
  workflowId: number;
  status: string;
  stepResults: StepResult[];
  currentStepId: number | null;
}

export async function startWorkflow(
  workflowId: number,
  orgId: number,
  initialInput?: unknown
): Promise<WorkflowExecutionResult> {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId)));

  if (!workflow) throw AppError.notFound(`Workflow ${workflowId} not found`);
  if (workflow.status !== "active") throw AppError.badRequest(`Workflow is not active (status: ${workflow.status})`);

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, workflowId))
    .orderBy(asc(workflowSteps.stepOrder));

  if (steps.length === 0) throw AppError.badRequest("Workflow has no steps");

  const stepResults: StepResult[] = steps.map((s, idx) => ({
    stepId: s.id,
    stepName: s.name,
    stepOrder: s.stepOrder,
    status: "pending" as const,
    ...(idx === 0 && initialInput !== undefined ? { output: initialInput } : {}),
  }));

  const [instance] = await db.insert(workflowInstances).values({
    workflowId,
    status: "running",
    currentStepId: steps[0].id,
    stepResults: stepResults,
  }).returning();

  return {
    instanceId: instance.id,
    workflowId,
    status: "running",
    stepResults,
    currentStepId: steps[0].id,
  };
}

export async function executeNextStep(
  instanceId: number,
  orgId: number,
  stepInput?: unknown
): Promise<WorkflowExecutionResult> {
  const [instance] = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, instanceId));

  if (!instance) throw AppError.notFound(`Workflow instance ${instanceId} not found`);
  if (instance.status !== "running") throw AppError.badRequest(`Instance is not running (status: ${instance.status})`);

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, instance.workflowId));

  if (!workflow || workflow.orgId !== orgId) throw AppError.notFound("Workflow not found or access denied");

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, instance.workflowId))
    .orderBy(asc(workflowSteps.stepOrder));

  const stepResults = (instance.stepResults as StepResult[]) || [];
  const currentStepIdx = steps.findIndex(s => s.id === instance.currentStepId);

  if (currentStepIdx < 0) throw AppError.notFound("Current step not found in workflow");

  const currentStep = steps[currentStepIdx];
  const currentResult = stepResults.find(r => r.stepId === currentStep.id);

  if (!currentResult) throw AppError.notFound("Step result record not found");

  let effectiveInput = stepInput;
  if (effectiveInput === undefined && currentStepIdx > 0) {
    const prevResult = stepResults.find(r => r.stepId === steps[currentStepIdx - 1].id);
    if (prevResult?.status === "completed" && prevResult.output !== undefined) {
      effectiveInput = prevResult.output;
    }
  }

  const conditions = currentStep.conditions as { skipIf?: Record<string, unknown> } | null;
  if (conditions?.skipIf && effectiveInput) {
    const shouldSkip = evaluateCondition(conditions.skipIf, effectiveInput);
    if (shouldSkip) {
      currentResult.status = "skipped";
      currentResult.completedAt = new Date().toISOString();
      return advanceToNextStep(instance, steps, stepResults, currentStepIdx, orgId);
    }
  }

  currentResult.status = "in_progress";
  currentResult.startedAt = new Date().toISOString();

  if (currentStep.assigneeRoleId) {
    const [role] = await db
      .select()
      .from(aiEmployeeRoles)
      .where(eq(aiEmployeeRoles.id, currentStep.assigneeRoleId));

    if (role) {
      const routingResult = await routeTask({
        orgId,
        taskTitle: currentStep.name,
        taskDescription: currentStep.type,
        taskCategory: role.category,
        requiredSkills: (role.skillsTags as string[]) || [],
      });

      if (routingResult.selectedEmployee) {
        currentResult.aiEmployeeId = routingResult.selectedEmployee.employeeId;
        currentResult.aiEmployeeName = routingResult.selectedEmployee.employeeName;

        try {
          const assignment = await createAssignment({
            orgId,
            taskId: instance.workflowId,
            aiEmployeeId: routingResult.selectedEmployee.employeeId,
            routingScore: routingResult.selectedEmployee.score,
            routingFactors: routingResult.selectedEmployee.factors,
            executionPhases: ["processing"],
          });
          currentResult.assignmentId = assignment.id;

          await transitionAssignment(assignment.id, orgId, "accepted");
          await transitionAssignment(assignment.id, orgId, "in_progress");
        } catch {
          // Assignment creation may fail if no matching task record exists for workflowId;
          // step still proceeds with routing info recorded in stepResults
        }
      }
    }
  }

  currentResult.output = effectiveInput;

  await db.update(workflowInstances).set({
    stepResults,
  }).where(eq(workflowInstances.id, instanceId));

  return {
    instanceId,
    workflowId: instance.workflowId,
    status: "running",
    stepResults,
    currentStepId: currentStep.id,
  };
}

export async function completeStep(
  instanceId: number,
  orgId: number,
  stepOutput: unknown
): Promise<WorkflowExecutionResult> {
  const [instance] = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, instanceId));

  if (!instance) throw AppError.notFound(`Workflow instance ${instanceId} not found`);

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, instance.workflowId));

  if (!workflow || workflow.orgId !== orgId) throw AppError.notFound("Workflow not found or access denied");

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, instance.workflowId))
    .orderBy(asc(workflowSteps.stepOrder));

  const stepResults = (instance.stepResults as StepResult[]) || [];
  const currentStepIdx = steps.findIndex(s => s.id === instance.currentStepId);

  if (currentStepIdx < 0) throw AppError.notFound("Current step not found");

  const currentResult = stepResults.find(r => r.stepId === steps[currentStepIdx].id);
  if (!currentResult) throw AppError.notFound("Step result not found");

  currentResult.status = "completed";
  currentResult.completedAt = new Date().toISOString();
  currentResult.output = stepOutput;

  if (currentResult.assignmentId) {
    try {
      await transitionAssignment(currentResult.assignmentId, orgId, "completed", { result: stepOutput });
    } catch {
    }
  }

  return advanceToNextStep(instance, steps, stepResults, currentStepIdx, orgId);
}

export async function failStep(
  instanceId: number,
  orgId: number,
  error: string
): Promise<WorkflowExecutionResult> {
  const [instance] = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, instanceId));

  if (!instance) throw AppError.notFound(`Workflow instance ${instanceId} not found`);

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, instance.workflowId));

  if (!workflow || workflow.orgId !== orgId) throw AppError.notFound("Workflow not found or access denied");

  const stepResults = (instance.stepResults as StepResult[]) || [];
  const currentResult = stepResults.find(r => r.stepId === instance.currentStepId);

  if (currentResult) {
    currentResult.status = "failed";
    currentResult.completedAt = new Date().toISOString();
    currentResult.error = error;

    if (currentResult.assignmentId) {
      try {
        await transitionAssignment(currentResult.assignmentId, orgId, "failed");
      } catch {
      }
    }
  }

  await db.update(workflowInstances).set({
    status: "failed",
    stepResults,
    completedAt: new Date(),
  }).where(eq(workflowInstances.id, instanceId));

  return {
    instanceId,
    workflowId: instance.workflowId,
    status: "failed",
    stepResults,
    currentStepId: instance.currentStepId,
  };
}

export async function getWorkflowInstanceStatus(instanceId: number, orgId: number) {
  const [instance] = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, instanceId));

  if (!instance) return null;

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, instance.workflowId), eq(workflows.orgId, orgId)));

  if (!workflow) return null;

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.workflowId, instance.workflowId))
    .orderBy(asc(workflowSteps.stepOrder));

  const stepResults = (instance.stepResults as StepResult[]) || [];

  return {
    instanceId: instance.id,
    workflowId: instance.workflowId,
    status: instance.status,
    currentStepId: instance.currentStepId,
    stepResults,
    totalSteps: steps.length,
    completedSteps: stepResults.filter(r => r.status === "completed").length,
    startedAt: instance.startedAt,
    completedAt: instance.completedAt,
  };
}

async function advanceToNextStep(
  instance: typeof workflowInstances.$inferSelect,
  steps: (typeof workflowSteps.$inferSelect)[],
  stepResults: StepResult[],
  currentIdx: number,
  orgId: number
): Promise<WorkflowExecutionResult> {
  const nextIdx = currentIdx + 1;

  if (nextIdx >= steps.length) {
    await db.update(workflowInstances).set({
      status: "completed",
      currentStepId: null,
      stepResults,
      completedAt: new Date(),
    }).where(eq(workflowInstances.id, instance.id));

    return {
      instanceId: instance.id,
      workflowId: instance.workflowId,
      status: "completed",
      stepResults,
      currentStepId: null,
    };
  }

  const nextStep = steps[nextIdx];

  await db.update(workflowInstances).set({
    currentStepId: nextStep.id,
    stepResults,
  }).where(eq(workflowInstances.id, instance.id));

  return {
    instanceId: instance.id,
    workflowId: instance.workflowId,
    status: "running",
    stepResults,
    currentStepId: nextStep.id,
  };
}

function evaluateCondition(condition: Record<string, unknown>, input: unknown): boolean {
  if (typeof input !== "object" || input === null) return false;
  const inputObj = input as Record<string, unknown>;

  for (const [key, expectedValue] of Object.entries(condition)) {
    if (inputObj[key] === expectedValue) return true;
  }
  return false;
}
