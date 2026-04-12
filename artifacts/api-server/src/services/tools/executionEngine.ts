import { db } from "@workspace/db";
import { toolRegistry, integrations } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../../middlewares/errorHandler";
import { evaluatePermission, checkRateLimit } from "./permissionEngine";
import { logToolAccess } from "./auditLogger";

const EXECUTION_TIMEOUT_MS = 5 * 60 * 1000;

interface ToolExecutionRequest {
  orgId: number;
  aiEmployeeId: number;
  toolName: string;
  operation: string;
  parameters?: Record<string, unknown>;
  resourceType?: string;
  requestId?: string;
}

interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  operation: string;
  result?: unknown;
  error?: string;
  executionDurationMs: number;
  permissionDecision: string;
  auditLogId: number;
}

export async function executeToolAccess(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
  const startTime = Date.now();
  const { orgId, aiEmployeeId, toolName, operation, parameters, resourceType, requestId } = request;

  const [tool] = await db
    .select()
    .from(toolRegistry)
    .where(eq(toolRegistry.name, toolName));

  if (!tool) {
    throw AppError.notFound(`Tool '${toolName}' not found in registry`);
  }

  const permissionResult = await evaluatePermission(orgId, aiEmployeeId, toolName, operation, resourceType);

  if (!permissionResult.allowed) {
    const auditLog = await logToolAccess({
      orgId,
      aiEmployeeId,
      toolId: tool.id,
      operation,
      parameters,
      result: "denied",
      permissionDecision: "denied",
      permissionDetails: permissionResult,
      executionDurationMs: Date.now() - startTime,
      errorMessage: permissionResult.reason,
      requestId,
    });

    return {
      success: false,
      toolName,
      operation,
      error: permissionResult.reason,
      executionDurationMs: Date.now() - startTime,
      permissionDecision: "denied",
      auditLogId: auditLog.id,
    };
  }

  const rateLimitResult = await checkRateLimit(orgId, aiEmployeeId, toolName);

  if (!rateLimitResult.allowed) {
    const auditLog = await logToolAccess({
      orgId,
      aiEmployeeId,
      toolId: tool.id,
      operation,
      parameters,
      result: "rate_limited",
      permissionDecision: "allowed",
      permissionDetails: { ...permissionResult, rateLimit: rateLimitResult },
      executionDurationMs: Date.now() - startTime,
      errorMessage: rateLimitResult.reason,
      requestId,
    });

    return {
      success: false,
      toolName,
      operation,
      error: rateLimitResult.reason,
      executionDurationMs: Date.now() - startTime,
      permissionDecision: "allowed",
      auditLogId: auditLog.id,
    };
  }

  const [connection] = await db
    .select()
    .from(integrations)
    .where(and(
      eq(integrations.orgId, orgId),
      eq(integrations.toolId, tool.id),
      eq(integrations.status, "connected"),
    ));

  if (!connection) {
    const auditLog = await logToolAccess({
      orgId,
      aiEmployeeId,
      toolId: tool.id,
      operation,
      parameters,
      result: "error",
      permissionDecision: "allowed",
      permissionDetails: permissionResult,
      executionDurationMs: Date.now() - startTime,
      errorMessage: `Tool '${toolName}' is not connected for this organization`,
      requestId,
    });

    return {
      success: false,
      toolName,
      operation,
      error: `Tool '${toolName}' is not connected for this organization`,
      executionDurationMs: Date.now() - startTime,
      permissionDecision: "allowed",
      auditLogId: auditLog.id,
    };
  }

  let executionResult: unknown;
  let executionError: string | undefined;
  let resultStatus: "success" | "error" | "timeout" = "success";

  try {
    executionResult = await executeWithTimeout(
      () => simulateToolInvocation(tool, operation, parameters),
      EXECUTION_TIMEOUT_MS,
    );
  } catch (err) {
    if (err instanceof Error && err.message === "EXECUTION_TIMEOUT") {
      resultStatus = "timeout";
      executionError = `Tool execution timed out after ${EXECUTION_TIMEOUT_MS / 1000} seconds`;
    } else {
      resultStatus = "error";
      executionError = err instanceof Error ? err.message : String(err);
    }
  }

  const executionDurationMs = Date.now() - startTime;

  const auditLog = await logToolAccess({
    orgId,
    aiEmployeeId,
    toolId: tool.id,
    operation,
    parameters,
    result: resultStatus,
    resultData: executionResult,
    permissionDecision: "allowed",
    permissionDetails: permissionResult,
    executionDurationMs,
    errorMessage: executionError,
    requestId,
  });

  return {
    success: resultStatus === "success",
    toolName,
    operation,
    result: executionResult,
    error: executionError,
    executionDurationMs,
    permissionDecision: "allowed",
    auditLogId: auditLog.id,
  };
}

async function executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("EXECUTION_TIMEOUT"));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function simulateToolInvocation(
  tool: typeof toolRegistry.$inferSelect,
  operation: string,
  parameters?: Record<string, unknown>,
): Promise<unknown> {
  return {
    status: "executed",
    tool: tool.name,
    operation,
    parameters: parameters || {},
    timestamp: new Date().toISOString(),
    message: `Tool invocation for ${tool.displayName} (${operation}) would execute here with real API integration`,
  };
}

export async function validateExecutionRequest(request: ToolExecutionRequest): Promise<string[]> {
  const errors: string[] = [];

  if (!request.toolName || request.toolName.trim() === "") {
    errors.push("toolName is required");
  }
  if (!request.operation || request.operation.trim() === "") {
    errors.push("operation is required");
  }
  if (!request.aiEmployeeId || request.aiEmployeeId <= 0) {
    errors.push("Valid aiEmployeeId is required");
  }

  const validOperations = ["read", "write", "delete", "stream", "configure"];
  if (request.operation && !validOperations.includes(request.operation)) {
    errors.push(`Invalid operation '${request.operation}'. Must be one of: ${validOperations.join(", ")}`);
  }

  return errors;
}
