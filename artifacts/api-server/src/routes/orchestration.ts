import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import {
  routeTask,
  getCapabilityMap,
  createAssignment,
  transitionAssignment,
  getAssignment,
  getAssignmentsForEmployee,
  getAssignmentsForTask,
  getValidTransitions,
  updateProgress,
  getProgressSnapshot,
  detectStalls,
  getActiveAssignmentProgress,
  resolveTaskDependencies,
  getBlockingStatus,
  unblockDependents,
  startWorkflow,
  executeNextStep,
  completeStep,
  failStep,
  getWorkflowInstanceStatus,
} from "../services/orchestration";

const router = Router();

const routeTaskBody = z.object({
  taskTitle: z.string().min(1),
  taskDescription: z.string().optional(),
  taskCategory: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredDepartment: z.string().optional(),
  excludeEmployeeIds: z.array(z.number()).optional(),
});

router.post("/orchestration/route", requireAuth, validate({ body: routeTaskBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const result = await routeTask({ orgId, ...req.body });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/capability-map", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const map = await getCapabilityMap(orgId);
    res.json({ data: map });
  } catch (error) {
    next(error);
  }
});

const createAssignmentBody = z.object({
  taskId: z.number().int(),
  aiEmployeeId: z.number().int(),
  routingScore: z.number().optional(),
  routingFactors: z.record(z.string(), z.number()).optional(),
  slaDeadlineHours: z.number().optional(),
  executionPhases: z.array(z.string()).optional(),
});

router.post("/orchestration/assignments", requireAuth, validate({ body: createAssignmentBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { slaDeadlineHours, ...rest } = req.body;
    const slaDeadline = slaDeadlineHours ? new Date(Date.now() + slaDeadlineHours * 3600000) : undefined;

    const assignment = await createAssignment({ orgId, ...rest, slaDeadline });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/assignments/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const assignment = await getAssignment(parseInt(String(req.params.id)), orgId);
    if (!assignment) throw AppError.notFound("Assignment not found");
    res.json(assignment);
  } catch (error) {
    next(error);
  }
});

const transitionBody = z.object({
  status: z.enum(["accepted", "in_progress", "paused", "waiting_dependency", "completed", "failed", "escalated", "cancelled"]),
  result: z.unknown().optional(),
  escalationReason: z.string().optional(),
});

router.patch("/orchestration/assignments/:id/transition", requireAuth, validate({ params: idParam, body: transitionBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { status, result, escalationReason } = req.body;
    const updated = await transitionAssignment(
      parseInt(String(req.params.id)),
      orgId,
      status,
      { result, escalationReason }
    );
    res.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid transition")) {
      next(AppError.badRequest(error.message));
    } else {
      next(error);
    }
  }
});

router.get("/orchestration/assignments/:id/transitions", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const assignment = await getAssignment(parseInt(String(req.params.id)), orgId);
    if (!assignment) throw AppError.notFound("Assignment not found");

    res.json({ currentStatus: assignment.status, validTransitions: getValidTransitions(assignment.status) });
  } catch (error) {
    next(error);
  }
});

const taskAssignmentsQuery = z.object({
  taskId: z.coerce.number().int().optional(),
  aiEmployeeId: z.coerce.number().int().optional(),
  activeOnly: z.enum(["true", "false"]).optional(),
});

router.get("/orchestration/assignments", requireAuth, validate({ query: taskAssignmentsQuery }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { taskId, aiEmployeeId, activeOnly } = req.query as Record<string, string>;

    if (taskId) {
      const data = await getAssignmentsForTask(parseInt(taskId), orgId);
      return res.json({ data });
    }
    if (aiEmployeeId) {
      const data = await getAssignmentsForEmployee(parseInt(aiEmployeeId), orgId, activeOnly === "true");
      return res.json({ data });
    }

    throw AppError.badRequest("Provide taskId or aiEmployeeId query parameter");
  } catch (error) {
    next(error);
  }
});

const progressBody = z.object({
  currentPhase: z.string().optional(),
  phaseProgress: z.number().int().min(0).max(100).optional(),
  checkpoint: z.object({
    name: z.string(),
    data: z.unknown().optional(),
  }).optional(),
});

router.patch("/orchestration/assignments/:id/progress", requireAuth, validate({ params: idParam, body: progressBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const updated = await updateProgress(parseInt(String(req.params.id)), orgId, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/assignments/:id/progress", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const snapshot = await getProgressSnapshot(parseInt(String(req.params.id)), orgId);
    if (!snapshot) throw AppError.notFound("Assignment not found");
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/progress", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const data = await getActiveAssignmentProgress(orgId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

const stallQuery = z.object({
  thresholdMinutes: z.coerce.number().int().min(1).default(30),
});

router.post("/orchestration/stalls/detect", requireAuth, validate({ query: stallQuery }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const thresholdMs = ((req.query as Record<string, string>).thresholdMinutes
      ? parseInt((req.query as Record<string, string>).thresholdMinutes) * 60 * 1000
      : 30 * 60 * 1000);

    const alerts = await detectStalls(orgId, thresholdMs);
    res.json({ alerts, count: alerts.length });
  } catch (error) {
    next(error);
  }
});

const dependencyBody = z.object({
  taskIds: z.array(z.number().int()).min(1),
});

router.post("/orchestration/dependencies/resolve", requireAuth, validate({ body: dependencyBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const graph = await resolveTaskDependencies(orgId, req.body.taskIds);
    res.json({
      order: graph.order,
      layers: graph.layers,
      ready: graph.ready,
      blocked: Object.fromEntries(graph.blocked),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/dependencies/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const status = await getBlockingStatus(parseInt(String(req.params.id)), orgId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post("/orchestration/dependencies/:id/unblock", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const unblockedIds = await unblockDependents(parseInt(String(req.params.id)), orgId);
    res.json({ unblockedTaskIds: unblockedIds, count: unblockedIds.length });
  } catch (error) {
    next(error);
  }
});

const startWorkflowBody = z.object({
  workflowId: z.number().int(),
  initialInput: z.unknown().optional(),
});

router.post("/orchestration/workflows/start", requireAuth, validate({ body: startWorkflowBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const result = await startWorkflow(req.body.workflowId, orgId, req.body.initialInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

const stepBody = z.object({
  input: z.unknown().optional(),
});

router.post("/orchestration/workflows/:id/execute-step", requireAuth, validate({ params: idParam, body: stepBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const result = await executeNextStep(parseInt(String(req.params.id)), orgId, req.body.input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const completeStepBody = z.object({
  output: z.unknown(),
});

router.post("/orchestration/workflows/:id/complete-step", requireAuth, validate({ params: idParam, body: completeStepBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const result = await completeStep(parseInt(String(req.params.id)), orgId, req.body.output);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const failStepBody = z.object({
  error: z.string(),
});

router.post("/orchestration/workflows/:id/fail-step", requireAuth, validate({ params: idParam, body: failStepBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const result = await failStep(parseInt(String(req.params.id)), orgId, req.body.error);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/orchestration/workflows/:id/status", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const status = await getWorkflowInstanceStatus(parseInt(String(req.params.id)), orgId);
    if (!status) throw AppError.notFound("Workflow instance not found");
    res.json(status);
  } catch (error) {
    next(error);
  }
});

const autoAssignBody = z.object({
  taskId: z.number().int(),
  taskTitle: z.string().min(1),
  taskDescription: z.string().optional(),
  taskCategory: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredDepartment: z.string().optional(),
  slaDeadlineHours: z.number().optional(),
  executionPhases: z.array(z.string()).optional(),
});

router.post("/orchestration/auto-assign", requireAuth, validate({ body: autoAssignBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { taskId, taskTitle, taskDescription, taskCategory, requiredSkills, preferredDepartment, slaDeadlineHours, executionPhases } = req.body;

    const routingResult = await routeTask({
      orgId,
      taskTitle,
      taskDescription,
      taskCategory,
      requiredSkills,
      preferredDepartment,
    });

    if (!routingResult.selectedEmployee) {
      return res.json({
        assigned: false,
        reason: routingResult.reasoning,
        candidates: routingResult.candidates,
      });
    }

    const slaDeadline = slaDeadlineHours ? new Date(Date.now() + slaDeadlineHours * 3600000) : undefined;

    const assignment = await createAssignment({
      orgId,
      taskId,
      aiEmployeeId: routingResult.selectedEmployee.employeeId,
      routingScore: routingResult.selectedEmployee.score,
      routingFactors: routingResult.selectedEmployee.factors,
      slaDeadline,
      executionPhases,
    });

    res.status(201).json({
      assigned: true,
      assignment,
      selectedEmployee: routingResult.selectedEmployee,
      reasoning: routingResult.reasoning,
      candidates: routingResult.candidates,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
