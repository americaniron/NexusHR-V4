import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { db } from "@workspace/db";
import { toolRegistry, integrations, toolPermissionOverrides, aiEmployees } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  evaluatePermission,
  assignRole,
  removeRole,
  getEmployeePermissions,
  getRoles,
} from "../services/tools/permissionEngine";
import { executeToolAccess, validateExecutionRequest } from "../services/tools/executionEngine";
import { queryAuditLogs, getAuditSummary } from "../services/tools/auditLogger";

const router = Router();

async function verifyEmployeeOwnership(orgId: number, aiEmployeeId: number): Promise<void> {
  const [employee] = await db
    .select({ id: aiEmployees.id, orgId: aiEmployees.orgId })
    .from(aiEmployees)
    .where(and(eq(aiEmployees.id, aiEmployeeId), eq(aiEmployees.orgId, orgId)));
  if (!employee) {
    throw AppError.notFound("AI employee not found in your organization");
  }
}

router.get("/tools/registry", requireAuth, async (_req, res, next) => {
  try {
    const tools = await db.select().from(toolRegistry).where(eq(toolRegistry.isActive, 1));
    res.json(tools);
  } catch (error) {
    next(error);
  }
});

router.get("/tools/registry/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const [tool] = await db.select().from(toolRegistry).where(eq(toolRegistry.id, parseInt(String(req.params.id))));
    if (!tool) throw AppError.notFound("Tool not found");
    res.json(tool);
  } catch (error) {
    next(error);
  }
});

const connectBody = z.object({
  toolId: z.number().int(),
  scopes: z.array(z.string()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

router.post("/tools/connections", requireAuth, validate({ body: connectBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { toolId, scopes, config } = req.body;

    const [tool] = await db.select().from(toolRegistry).where(eq(toolRegistry.id, toolId));
    if (!tool) throw AppError.notFound("Tool not found");

    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)));

    if (existing && existing.status === "connected") {
      throw AppError.badRequest("Tool is already connected");
    }

    if (existing) {
      const [updated] = await db.update(integrations).set({
        status: "connected",
        connectedScopes: scopes || tool.requiredScopes,
        connectionConfig: config || null,
        connectedAt: new Date(),
        disconnectedAt: null,
        healthStatus: "healthy",
        updatedAt: new Date(),
      }).where(eq(integrations.id, existing.id)).returning();
      res.json(updated);
    } else {
      const [connection] = await db.insert(integrations).values({
        orgId,
        toolId,
        status: "connected",
        connectedScopes: scopes || tool.requiredScopes,
        connectionConfig: config || null,
        connectedAt: new Date(),
        healthStatus: "healthy",
      }).returning();
      res.status(201).json(connection);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/tools/connections/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const connectionId = parseInt(String(req.params.id));
    const [connection] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, connectionId), eq(integrations.orgId, orgId)));

    if (!connection) throw AppError.notFound("Connection not found");
    if (connection.status === "disconnected") throw AppError.badRequest("Connection is already disconnected");

    const [updated] = await db.update(integrations).set({
      status: "disconnected",
      disconnectedAt: new Date(),
      healthStatus: "unknown",
      updatedAt: new Date(),
    }).where(eq(integrations.id, connectionId)).returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/tools/connections", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const connections = await db
      .select()
      .from(integrations)
      .where(eq(integrations.orgId, orgId));

    res.json(connections);
  } catch (error) {
    next(error);
  }
});

router.post("/tools/connections/:id/health", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const connectionId = parseInt(String(req.params.id));
    const [connection] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, connectionId), eq(integrations.orgId, orgId)));

    if (!connection) throw AppError.notFound("Connection not found");

    const [updated] = await db.update(integrations).set({
      lastHealthCheck: new Date(),
      healthStatus: connection.status === "connected" ? "healthy" : "unhealthy",
      updatedAt: new Date(),
    }).where(eq(integrations.id, connectionId)).returning();

    res.json({ connectionId: updated.id, healthStatus: updated.healthStatus, checkedAt: updated.lastHealthCheck });
  } catch (error) {
    next(error);
  }
});

router.get("/tools/roles", requireAuth, async (_req, res, next) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

const assignRoleBody = z.object({
  aiEmployeeId: z.number().int(),
  roleId: z.number().int(),
  expiresAt: z.string().datetime().optional(),
});

router.post("/tools/role-assignments", requireAuth, validate({ body: assignRoleBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { aiEmployeeId, roleId, expiresAt } = req.body;
    await verifyEmployeeOwnership(orgId, aiEmployeeId);
    const assignment = await assignRole(orgId, aiEmployeeId, roleId, expiresAt ? new Date(expiresAt) : undefined);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

const removeRoleBody = z.object({
  aiEmployeeId: z.number().int(),
  roleId: z.number().int(),
});

router.delete("/tools/role-assignments", requireAuth, validate({ body: removeRoleBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { aiEmployeeId, roleId } = req.body;
    await verifyEmployeeOwnership(orgId, aiEmployeeId);
    const removed = await removeRole(orgId, aiEmployeeId, roleId);
    res.json(removed);
  } catch (error) {
    next(error);
  }
});

router.get("/tools/permissions/:aiEmployeeId", requireAuth, validate({ params: z.object({ aiEmployeeId: z.coerce.number().int() }) }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const aiEmployeeId = parseInt(String(req.params.aiEmployeeId));
    await verifyEmployeeOwnership(orgId, aiEmployeeId);
    const permissions = await getEmployeePermissions(orgId, aiEmployeeId);
    res.json(permissions);
  } catch (error) {
    next(error);
  }
});

const checkPermBody = z.object({
  aiEmployeeId: z.number().int(),
  toolName: z.string().min(1),
  operation: z.string().min(1),
  resourceType: z.string().optional(),
});

router.post("/tools/permissions/check", requireAuth, validate({ body: checkPermBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { aiEmployeeId, toolName, operation, resourceType } = req.body;
    await verifyEmployeeOwnership(orgId, aiEmployeeId);
    const result = await evaluatePermission(orgId, aiEmployeeId, toolName, operation, resourceType);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const overrideBody = z.object({
  aiEmployeeId: z.number().int(),
  toolId: z.number().int(),
  allowedOperations: z.array(z.string()).optional(),
  deniedOperations: z.array(z.string()).optional(),
  resourceRestrictions: z.record(z.string(), z.unknown()).optional(),
  temporalConstraints: z.object({
    daysOfWeek: z.array(z.number()).optional(),
    startHour: z.number().optional(),
    endHour: z.number().optional(),
    timezone: z.string().optional(),
  }).optional(),
  rateLimitOverride: z.record(z.string(), z.number()).optional(),
});

router.post("/tools/permission-overrides", requireAuth, validate({ body: overrideBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { aiEmployeeId, toolId, ...rest } = req.body;
    await verifyEmployeeOwnership(orgId, aiEmployeeId);

    const [override] = await db.insert(toolPermissionOverrides).values({
      orgId,
      aiEmployeeId,
      toolId,
      allowedOperations: rest.allowedOperations || [],
      deniedOperations: rest.deniedOperations || [],
      resourceRestrictions: rest.resourceRestrictions || null,
      temporalConstraints: rest.temporalConstraints || null,
      rateLimitOverride: rest.rateLimitOverride || null,
    }).returning();

    res.status(201).json(override);
  } catch (error) {
    next(error);
  }
});

router.delete("/tools/permission-overrides/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const overrideId = parseInt(String(req.params.id));
    const deleted = await db
      .delete(toolPermissionOverrides)
      .where(and(eq(toolPermissionOverrides.id, overrideId), eq(toolPermissionOverrides.orgId, orgId)))
      .returning();

    if (deleted.length === 0) throw AppError.notFound("Permission override not found");
    res.json(deleted[0]);
  } catch (error) {
    next(error);
  }
});

const executeBody = z.object({
  aiEmployeeId: z.number().int(),
  toolName: z.string().min(1),
  operation: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).optional(),
  resourceType: z.string().optional(),
});

router.post("/tools/execute", requireAuth, validate({ body: executeBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const { aiEmployeeId } = req.body;
    await verifyEmployeeOwnership(orgId, aiEmployeeId);

    const request = { orgId, ...req.body, requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };

    const validationErrors = await validateExecutionRequest(request);
    if (validationErrors.length > 0) {
      throw AppError.badRequest(`Validation failed: ${validationErrors.join(", ")}`);
    }

    const result = await executeToolAccess(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const auditQueryParams = z.object({
  aiEmployeeId: z.coerce.number().int().optional(),
  toolId: z.coerce.number().int().optional(),
  operation: z.string().optional(),
  result: z.string().optional(),
  permissionDecision: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

router.get("/tools/audit-logs", requireAuth, validate({ query: auditQueryParams }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const filters = {
      orgId,
      aiEmployeeId: req.query.aiEmployeeId ? Number(req.query.aiEmployeeId) : undefined,
      toolId: req.query.toolId ? Number(req.query.toolId) : undefined,
      operation: req.query.operation as string | undefined,
      result: req.query.result as string | undefined,
      permissionDecision: req.query.permissionDecision as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };

    const result = await queryAuditLogs(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/tools/audit-summary", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const summary = await getAuditSummary(orgId, startDate, endDate);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
