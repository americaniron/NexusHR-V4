import { db } from "@workspace/db";
import { toolRoles, toolRoleAssignments, toolPermissionOverrides, toolRegistry } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../../middlewares/errorHandler";

interface RolePermission {
  tool: string;
  operations: string[];
  resources: string;
}

interface TemporalConstraint {
  daysOfWeek?: number[];
  startHour?: number;
  endHour?: number;
  timezone?: string;
}

interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  checkedLevels: string[];
  roleMatched?: string;
  temporalValid?: boolean;
  rateLimitValid?: boolean;
}

export async function evaluatePermission(
  orgId: number,
  aiEmployeeId: number,
  toolName: string,
  operation: string,
  resourceType?: string
): Promise<PermissionCheckResult> {
  const checkedLevels: string[] = [];

  const [tool] = await db
    .select()
    .from(toolRegistry)
    .where(eq(toolRegistry.name, toolName));

  if (!tool) {
    return { allowed: false, reason: `Tool '${toolName}' not found in registry`, checkedLevels: ["tool_registry"] };
  }

  if (!tool.isActive) {
    return { allowed: false, reason: `Tool '${toolName}' is disabled`, checkedLevels: ["tool_registry"] };
  }

  const capabilities = (tool.capabilities as string[]) || [];
  if (!capabilities.includes(operation)) {
    return { allowed: false, reason: `Tool '${toolName}' does not support operation '${operation}'`, checkedLevels: ["tool_capability"] };
  }
  checkedLevels.push("tool_capability");

  const overrides = await db
    .select()
    .from(toolPermissionOverrides)
    .where(and(
      eq(toolPermissionOverrides.orgId, orgId),
      eq(toolPermissionOverrides.aiEmployeeId, aiEmployeeId),
      eq(toolPermissionOverrides.toolId, tool.id),
      eq(toolPermissionOverrides.isActive, true),
    ));

  if (overrides.length > 0) {
    const override = overrides[0];
    checkedLevels.push("permission_override");

    const denied = (override.deniedOperations as string[]) || [];
    if (denied.includes(operation) || denied.includes("*")) {
      return { allowed: false, reason: `Operation '${operation}' explicitly denied by permission override`, checkedLevels };
    }

    const allowed = (override.allowedOperations as string[]) || [];
    if (allowed.includes(operation) || allowed.includes("*")) {
      if (override.resourceRestrictions && resourceType) {
        const restrictions = override.resourceRestrictions as Record<string, string[]>;
        if (restrictions.allowed && !restrictions.allowed.includes(resourceType) && !restrictions.allowed.includes("*")) {
          return { allowed: false, reason: `Resource '${resourceType}' not in allowed resources for override`, checkedLevels };
        }
      }

      const temporalCheck = checkTemporalConstraints(override.temporalConstraints as TemporalConstraint | null);
      if (!temporalCheck.valid) {
        return { allowed: false, reason: temporalCheck.reason, checkedLevels: [...checkedLevels, "temporal"], temporalValid: false };
      }

      return { allowed: true, reason: "Allowed by permission override", checkedLevels, temporalValid: true };
    }
  }

  const roleAssignments = await db
    .select({
      roleId: toolRoleAssignments.roleId,
      expiresAt: toolRoleAssignments.expiresAt,
    })
    .from(toolRoleAssignments)
    .where(and(
      eq(toolRoleAssignments.orgId, orgId),
      eq(toolRoleAssignments.aiEmployeeId, aiEmployeeId),
    ));

  if (roleAssignments.length === 0) {
    checkedLevels.push("rbac");
    return { allowed: false, reason: "No tool roles assigned to this AI employee", checkedLevels };
  }

  for (const assignment of roleAssignments) {
    if (assignment.expiresAt && new Date(assignment.expiresAt) < new Date()) {
      continue;
    }

    const [role] = await db
      .select()
      .from(toolRoles)
      .where(eq(toolRoles.id, assignment.roleId));

    if (!role) continue;

    const permissions = (role.permissions as RolePermission[]) || [];

    for (const perm of permissions) {
      if (perm.tool !== "*" && perm.tool !== toolName) continue;
      if (!perm.operations.includes(operation) && !perm.operations.includes("*")) continue;

      if (resourceType && perm.resources !== "*") {
        const allowedResources = perm.resources.split(",").map(r => r.trim());
        if (!allowedResources.includes(resourceType) && !allowedResources.includes("assigned")) {
          continue;
        }
      }

      checkedLevels.push("rbac");
      return { allowed: true, reason: `Allowed by role '${role.displayName}'`, checkedLevels, roleMatched: role.name };
    }
  }

  checkedLevels.push("rbac");
  return { allowed: false, reason: `No role grants '${operation}' on '${toolName}'`, checkedLevels };
}

function checkTemporalConstraints(constraints: TemporalConstraint | null): { valid: boolean; reason: string } {
  if (!constraints) return { valid: true, reason: "No temporal constraints" };

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  if (constraints.daysOfWeek && !constraints.daysOfWeek.includes(currentDay)) {
    return { valid: false, reason: `Access not allowed on day ${currentDay}. Allowed days: ${constraints.daysOfWeek.join(", ")}` };
  }

  if (constraints.startHour !== undefined && constraints.endHour !== undefined) {
    if (currentHour < constraints.startHour || currentHour >= constraints.endHour) {
      return { valid: false, reason: `Access only allowed between ${constraints.startHour}:00 and ${constraints.endHour}:00. Current hour: ${currentHour}` };
    }
  }

  return { valid: true, reason: "Temporal constraints satisfied" };
}

const rateLimitBuckets = new Map<string, number[]>();

const BUCKET_CLEANUP_INTERVAL_MS = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitBuckets) {
    const filtered = timestamps.filter(t => now - t < 86_400_000);
    if (filtered.length === 0) {
      rateLimitBuckets.delete(key);
    } else {
      rateLimitBuckets.set(key, filtered);
    }
  }
}, BUCKET_CLEANUP_INTERVAL_MS).unref();

export async function checkRateLimit(
  orgId: number,
  aiEmployeeId: number,
  toolName: string,
): Promise<{ allowed: boolean; reason: string; remaining?: number }> {
  const [tool] = await db
    .select()
    .from(toolRegistry)
    .where(eq(toolRegistry.name, toolName));

  if (!tool) return { allowed: false, reason: "Tool not found" };

  const rateLimits = (tool.rateLimits as { requestsPerMinute?: number; requestsPerDay?: number; burstLimit?: number }) || {};

  const overrides = await db
    .select()
    .from(toolPermissionOverrides)
    .where(and(
      eq(toolPermissionOverrides.orgId, orgId),
      eq(toolPermissionOverrides.aiEmployeeId, aiEmployeeId),
      eq(toolPermissionOverrides.toolId, tool.id),
      eq(toolPermissionOverrides.isActive, true),
    ));

  let effectiveLimits = rateLimits;
  if (overrides.length > 0 && overrides[0].rateLimitOverride) {
    effectiveLimits = { ...rateLimits, ...(overrides[0].rateLimitOverride as Record<string, number>) };
  }

  const bucketKey = `${orgId}:${aiEmployeeId}:${toolName}`;
  const now = Date.now();
  const timestamps = rateLimitBuckets.get(bucketKey) || [];

  if (effectiveLimits.requestsPerMinute) {
    const oneMinuteAgo = now - 60_000;
    const recentCount = timestamps.filter(t => t > oneMinuteAgo).length;
    if (recentCount >= effectiveLimits.requestsPerMinute) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${recentCount}/${effectiveLimits.requestsPerMinute} requests per minute`,
        remaining: 0,
      };
    }
  }

  if (effectiveLimits.requestsPerDay) {
    const oneDayAgo = now - 86_400_000;
    const dailyCount = timestamps.filter(t => t > oneDayAgo).length;
    if (dailyCount >= effectiveLimits.requestsPerDay) {
      return {
        allowed: false,
        reason: `Daily rate limit exceeded: ${dailyCount}/${effectiveLimits.requestsPerDay} requests per day`,
        remaining: 0,
      };
    }
  }

  timestamps.push(now);
  rateLimitBuckets.set(bucketKey, timestamps);

  const minuteRemaining = effectiveLimits.requestsPerMinute
    ? effectiveLimits.requestsPerMinute - timestamps.filter(t => t > now - 60_000).length
    : undefined;

  return {
    allowed: true,
    reason: "Rate limit check passed",
    remaining: minuteRemaining,
  };
}

export async function assignRole(orgId: number, aiEmployeeId: number, roleId: number, expiresAt?: Date) {
  const [role] = await db.select().from(toolRoles).where(eq(toolRoles.id, roleId));
  if (!role) throw AppError.notFound("Tool role not found");

  const existing = await db
    .select()
    .from(toolRoleAssignments)
    .where(and(
      eq(toolRoleAssignments.orgId, orgId),
      eq(toolRoleAssignments.aiEmployeeId, aiEmployeeId),
      eq(toolRoleAssignments.roleId, roleId),
    ));

  if (existing.length > 0) {
    throw AppError.badRequest("Role already assigned to this AI employee");
  }

  const [assignment] = await db.insert(toolRoleAssignments).values({
    orgId,
    aiEmployeeId,
    roleId,
    expiresAt: expiresAt ?? null,
  }).returning();

  return assignment;
}

export async function removeRole(orgId: number, aiEmployeeId: number, roleId: number) {
  const deleted = await db
    .delete(toolRoleAssignments)
    .where(and(
      eq(toolRoleAssignments.orgId, orgId),
      eq(toolRoleAssignments.aiEmployeeId, aiEmployeeId),
      eq(toolRoleAssignments.roleId, roleId),
    ))
    .returning();

  if (deleted.length === 0) throw AppError.notFound("Role assignment not found");
  return deleted[0];
}

export async function getEmployeePermissions(orgId: number, aiEmployeeId: number) {
  const roleAssignments = await db
    .select()
    .from(toolRoleAssignments)
    .where(and(
      eq(toolRoleAssignments.orgId, orgId),
      eq(toolRoleAssignments.aiEmployeeId, aiEmployeeId),
    ));

  const roles = [];
  for (const assignment of roleAssignments) {
    const [role] = await db.select().from(toolRoles).where(eq(toolRoles.id, assignment.roleId));
    if (role) {
      roles.push({
        ...role,
        expiresAt: assignment.expiresAt,
        assignedAt: assignment.assignedAt,
      });
    }
  }

  const overrides = await db
    .select()
    .from(toolPermissionOverrides)
    .where(and(
      eq(toolPermissionOverrides.orgId, orgId),
      eq(toolPermissionOverrides.aiEmployeeId, aiEmployeeId),
      eq(toolPermissionOverrides.isActive, true),
    ));

  return { roles, overrides };
}

export async function getRoles() {
  return db.select().from(toolRoles);
}
