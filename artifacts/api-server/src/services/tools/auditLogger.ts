import { db } from "@workspace/db";
import { toolAuditLogs } from "@workspace/db/schema";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

interface AuditLogEntry {
  orgId: number;
  aiEmployeeId: number;
  toolId: number;
  operation: string;
  parameters?: unknown;
  result: "success" | "denied" | "error" | "rate_limited" | "timeout";
  resultData?: unknown;
  permissionDecision: "allowed" | "denied" | "escalated";
  permissionDetails?: unknown;
  executionDurationMs?: number;
  errorMessage?: string;
  requestId?: string;
}

export async function logToolAccess(entry: AuditLogEntry) {
  const [log] = await db.insert(toolAuditLogs).values({
    orgId: entry.orgId,
    aiEmployeeId: entry.aiEmployeeId,
    toolId: entry.toolId,
    operation: entry.operation,
    parameters: entry.parameters ?? null,
    result: entry.result,
    resultData: entry.resultData ?? null,
    permissionDecision: entry.permissionDecision,
    permissionDetails: entry.permissionDetails ?? null,
    executionDurationMs: entry.executionDurationMs ?? null,
    errorMessage: entry.errorMessage ?? null,
    requestId: entry.requestId ?? null,
  }).returning();

  return log;
}

interface AuditQueryFilters {
  orgId: number;
  aiEmployeeId?: number;
  toolId?: number;
  operation?: string;
  result?: string;
  permissionDecision?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function queryAuditLogs(filters: AuditQueryFilters) {
  const conditions = [eq(toolAuditLogs.orgId, filters.orgId)];

  if (filters.aiEmployeeId) {
    conditions.push(eq(toolAuditLogs.aiEmployeeId, filters.aiEmployeeId));
  }
  if (filters.toolId) {
    conditions.push(eq(toolAuditLogs.toolId, filters.toolId));
  }
  if (filters.operation) {
    conditions.push(eq(toolAuditLogs.operation, filters.operation));
  }
  if (filters.result) {
    conditions.push(eq(toolAuditLogs.result, filters.result));
  }
  if (filters.permissionDecision) {
    conditions.push(eq(toolAuditLogs.permissionDecision, filters.permissionDecision));
  }
  if (filters.startDate) {
    conditions.push(gte(toolAuditLogs.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(toolAuditLogs.createdAt, filters.endDate));
  }

  const limit = Math.min(filters.limit || 50, 200);
  const offset = filters.offset || 0;

  const logs = await db
    .select()
    .from(toolAuditLogs)
    .where(and(...conditions))
    .orderBy(desc(toolAuditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolAuditLogs)
    .where(and(...conditions));

  return {
    logs,
    total: countResult?.count || 0,
    limit,
    offset,
  };
}

export async function getAuditSummary(orgId: number, startDate?: Date, endDate?: Date) {
  const conditions = [eq(toolAuditLogs.orgId, orgId)];
  if (startDate) conditions.push(gte(toolAuditLogs.createdAt, startDate));
  if (endDate) conditions.push(lte(toolAuditLogs.createdAt, endDate));

  const byResult = await db
    .select({
      result: toolAuditLogs.result,
      count: sql<number>`count(*)::int`,
    })
    .from(toolAuditLogs)
    .where(and(...conditions))
    .groupBy(toolAuditLogs.result);

  const byTool = await db
    .select({
      toolId: toolAuditLogs.toolId,
      count: sql<number>`count(*)::int`,
    })
    .from(toolAuditLogs)
    .where(and(...conditions))
    .groupBy(toolAuditLogs.toolId);

  const byEmployee = await db
    .select({
      aiEmployeeId: toolAuditLogs.aiEmployeeId,
      count: sql<number>`count(*)::int`,
    })
    .from(toolAuditLogs)
    .where(and(...conditions))
    .groupBy(toolAuditLogs.aiEmployeeId);

  return {
    byResult,
    byTool,
    byEmployee,
    totalEntries: byResult.reduce((sum, r) => sum + r.count, 0),
  };
}
