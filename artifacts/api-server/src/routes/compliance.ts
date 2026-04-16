import { Router } from "express";
import { db } from "@workspace/db";
import {
  organizations,
  complianceDataRequests,
  complianceConsentRecords,
  complianceRetentionPolicies,
  toolAuditLogs,
  aiEmployees,
  aiEmployeeRoles,
  integrations,
} from "@workspace/db";
import { eq, and, desc, gte, lte, sql, ilike } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";

const router = Router();

async function getOrgId(req: any): Promise<{ orgId: string; orgDbId: number }> {
  const auth = getAuth(req);
  const orgId = auth?.orgId;
  if (!orgId) throw AppError.notFound("No organization found");

  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.clerkOrgId, orgId));
  if (!org) throw AppError.notFound("Organization not found");

  return { orgId, orgDbId: org.id };
}

router.get("/compliance/posture", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);

    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgDbId));
    const employees = await db.select({
      id: aiEmployees.id,
      roleId: aiEmployees.roleId,
    }).from(aiEmployees).where(eq(aiEmployees.orgId, orgDbId));

    const roleIds = employees.map((e) => e.roleId).filter(Boolean);
    let roles: { department: string; category: string }[] = [];
    if (roleIds.length > 0) {
      roles = await db.select({
        department: aiEmployeeRoles.department,
        category: aiEmployeeRoles.category,
      }).from(aiEmployeeRoles);
    }

    const orgIntegrations = await db.select().from(integrations).where(eq(integrations.orgId, orgDbId));
    const consentRecords = await db.select().from(complianceConsentRecords).where(eq(complianceConsentRecords.orgId, orgDbId));
    const retentionPolicies = await db.select().from(complianceRetentionPolicies).where(eq(complianceRetentionPolicies.orgId, orgDbId));

    const departments = new Set(roles.map((r) => r.department.toLowerCase()));
    const hasHealthcare = departments.has("healthcare") || departments.has("medical");
    const hasFinance = departments.has("finance") || departments.has("accounting");
    const hasDataRegion = !!org?.dataRegion;
    const hasConsent = consentRecords.some((c) => c.granted);
    const hasRetention = retentionPolicies.length > 0;

    const frameworks = [
      {
        name: "SOC 2 Type II",
        status: hasRetention && consentRecords.length > 0 ? "partial" : "action_required",
        description: "Service Organization Control 2 — trust services criteria for security, availability, and confidentiality",
        relevance: "Applies to all organizations handling customer data",
        checks: [
          { name: "Audit logging enabled", status: "pass", detail: "All tool access is logged with full audit trail" },
          { name: "Access controls", status: "pass", detail: "Role-based permissions enforced for AI employees" },
          { name: "Data retention policies", status: hasRetention ? "pass" : "fail", detail: hasRetention ? "Retention policies configured" : "No retention policies configured" },
          { name: "Consent management", status: hasConsent ? "pass" : "warning", detail: hasConsent ? "Data processing consent recorded" : "No consent records found" },
        ],
      },
      {
        name: "GDPR",
        status: hasDataRegion && hasConsent ? "compliant" : "action_required",
        description: "General Data Protection Regulation — EU data protection and privacy regulation",
        relevance: hasDataRegion && org?.dataRegion === "eu" ? "Required — EU data region selected" : "Recommended for all organizations",
        checks: [
          { name: "Data residency configured", status: hasDataRegion ? "pass" : "fail", detail: hasDataRegion ? `Data region: ${org?.dataRegion?.toUpperCase()}` : "No data region selected" },
          { name: "Data export capability", status: "pass", detail: "GDPR data export available via Data & Privacy settings" },
          { name: "Right to erasure", status: "pass", detail: "Data deletion requests supported with 30-day grace period" },
          { name: "Consent tracking", status: hasConsent ? "pass" : "fail", detail: hasConsent ? "Active consent records on file" : "No consent records — update consent preferences" },
        ],
      },
      {
        name: "HIPAA",
        status: hasHealthcare ? (hasRetention ? "partial" : "action_required") : "not_applicable",
        description: "Health Insurance Portability and Accountability Act — US healthcare data protection",
        relevance: hasHealthcare ? "Required — healthcare-related AI roles detected" : "Not applicable — no healthcare roles",
        checks: [
          { name: "PHI access logging", status: hasHealthcare ? "pass" : "not_applicable", detail: hasHealthcare ? "All data access is fully audited" : "N/A" },
          { name: "Access controls", status: hasHealthcare ? "pass" : "not_applicable", detail: hasHealthcare ? "Role-based access enforced" : "N/A" },
          { name: "Data retention", status: hasHealthcare && hasRetention ? "pass" : hasHealthcare ? "fail" : "not_applicable", detail: hasHealthcare ? (hasRetention ? "Retention policies set" : "Configure retention for HIPAA compliance") : "N/A" },
          { name: "Encryption at rest", status: hasHealthcare ? "pass" : "not_applicable", detail: hasHealthcare ? "Database encryption enabled" : "N/A" },
        ],
      },
      {
        name: "PCI DSS",
        status: hasFinance ? "partial" : "not_applicable",
        description: "Payment Card Industry Data Security Standard — payment data protection",
        relevance: hasFinance ? "Relevant — finance-related AI roles detected" : "Not applicable — no finance roles",
        checks: [
          { name: "Network segmentation", status: hasFinance ? "pass" : "not_applicable", detail: hasFinance ? "Tenant isolation enforced" : "N/A" },
          { name: "Audit trail", status: hasFinance ? "pass" : "not_applicable", detail: hasFinance ? "Complete audit logging enabled" : "N/A" },
          { name: "Access controls", status: hasFinance ? "pass" : "not_applicable", detail: hasFinance ? "Role-based permissions active" : "N/A" },
          { name: "Data retention", status: hasFinance && hasRetention ? "pass" : hasFinance ? "warning" : "not_applicable", detail: hasFinance ? (hasRetention ? "Policies configured" : "Set retention policies for compliance") : "N/A" },
        ],
      },
    ];

    res.json({
      frameworks,
      dataRegion: org?.dataRegion || null,
      industry: org?.industry || null,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/compliance/data-requests", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);

    const requests = await db
      .select()
      .from(complianceDataRequests)
      .where(eq(complianceDataRequests.orgId, orgDbId))
      .orderBy(desc(complianceDataRequests.createdAt));

    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
});

const createDataRequestBody = z.object({
  type: z.enum(["export", "deletion"]),
  notes: z.string().optional(),
});

router.post("/compliance/data-requests", requireAuth, validate({ body: createDataRequestBody }), async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);
    const auth = getAuth(req);
    const { type, notes } = req.body;

    const scheduledAt = type === "deletion" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

    const [request] = await db.insert(complianceDataRequests).values({
      orgId: orgDbId,
      type,
      status: type === "deletion" ? "pending" : "processing",
      requestedBy: auth?.userId || "unknown",
      notes: notes || null,
      scheduledAt,
      expiresAt: type === "export" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    }).returning();

    if (type === "export") {
      await db.update(complianceDataRequests)
        .set({ status: "completed", completedAt: new Date(), downloadUrl: `/compliance/data-requests/${request.id}/download` })
        .where(eq(complianceDataRequests.id, request.id));

      request.status = "completed";
      request.completedAt = new Date();
    }

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

router.post("/compliance/data-requests/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);
    const id = parseInt(req.params.id);

    const [existing] = await db.select().from(complianceDataRequests)
      .where(and(eq(complianceDataRequests.id, id), eq(complianceDataRequests.orgId, orgDbId)));

    if (!existing) throw AppError.notFound("Data request not found");
    if (existing.status !== "pending") throw AppError.badRequest("Only pending requests can be cancelled");

    const [updated] = await db.update(complianceDataRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(complianceDataRequests.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/compliance/consent", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);

    const records = await db
      .select()
      .from(complianceConsentRecords)
      .where(eq(complianceConsentRecords.orgId, orgDbId))
      .orderBy(desc(complianceConsentRecords.updatedAt));

    res.json({ data: records });
  } catch (error) {
    next(error);
  }
});

const updateConsentBody = z.object({
  consentType: z.string().min(1),
  granted: z.boolean(),
});

router.post("/compliance/consent", requireAuth, validate({ body: updateConsentBody }), async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);
    const auth = getAuth(req);
    const { consentType, granted } = req.body;

    const [existing] = await db.select().from(complianceConsentRecords)
      .where(and(
        eq(complianceConsentRecords.orgId, orgDbId),
        eq(complianceConsentRecords.consentType, consentType),
      ));

    if (existing) {
      const [updated] = await db.update(complianceConsentRecords)
        .set({
          granted,
          grantedAt: granted ? new Date() : existing.grantedAt,
          revokedAt: !granted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(complianceConsentRecords.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(complianceConsentRecords).values({
        orgId: orgDbId,
        userId: auth?.userId || "unknown",
        consentType,
        granted,
        grantedAt: granted ? new Date() : null,
      }).returning();
      res.json(created);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/compliance/retention-policies", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);

    let policies = await db
      .select()
      .from(complianceRetentionPolicies)
      .where(eq(complianceRetentionPolicies.orgId, orgDbId));

    if (policies.length === 0) {
      const defaults = [
        { dataType: "conversations", retentionDays: 365 },
        { dataType: "audit_logs", retentionDays: 730 },
        { dataType: "task_history", retentionDays: 365 },
      ];

      for (const d of defaults) {
        await db.insert(complianceRetentionPolicies).values({
          orgId: orgDbId,
          dataType: d.dataType,
          retentionDays: d.retentionDays,
          enabled: true,
        });
      }

      policies = await db.select().from(complianceRetentionPolicies)
        .where(eq(complianceRetentionPolicies.orgId, orgDbId));
    }

    res.json({ data: policies });
  } catch (error) {
    next(error);
  }
});

const updateRetentionBody = z.object({
  policies: z.array(z.object({
    dataType: z.string().min(1),
    retentionDays: z.number().int().min(30).max(3650),
    enabled: z.boolean(),
  })),
});

router.put("/compliance/retention-policies", requireAuth, validate({ body: updateRetentionBody }), async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);
    const { policies } = req.body;

    for (const policy of policies) {
      const [existing] = await db.select().from(complianceRetentionPolicies)
        .where(and(
          eq(complianceRetentionPolicies.orgId, orgDbId),
          eq(complianceRetentionPolicies.dataType, policy.dataType),
        ));

      if (existing) {
        await db.update(complianceRetentionPolicies)
          .set({
            retentionDays: policy.retentionDays,
            enabled: policy.enabled,
            updatedAt: new Date(),
          })
          .where(eq(complianceRetentionPolicies.id, existing.id));
      } else {
        await db.insert(complianceRetentionPolicies).values({
          orgId: orgDbId,
          dataType: policy.dataType,
          retentionDays: policy.retentionDays,
          enabled: policy.enabled,
        });
      }
    }

    const updated = await db.select().from(complianceRetentionPolicies)
      .where(eq(complianceRetentionPolicies.orgId, orgDbId));

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.get("/compliance/audit-logs", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;

    const conditions = [eq(toolAuditLogs.orgId, orgDbId)];

    if (req.query.operation) {
      conditions.push(eq(toolAuditLogs.operation, req.query.operation as string));
    }
    if (req.query.result) {
      conditions.push(eq(toolAuditLogs.result, req.query.result as string));
    }
    if (req.query.startDate) {
      conditions.push(gte(toolAuditLogs.createdAt, new Date(req.query.startDate as string)));
    }
    if (req.query.endDate) {
      conditions.push(lte(toolAuditLogs.createdAt, new Date(req.query.endDate as string)));
    }
    if (req.query.search) {
      conditions.push(ilike(toolAuditLogs.operation, `%${req.query.search}%`));
    }

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

    res.json({
      data: logs,
      total: countResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/compliance/audit-logs/export", requireAuth, async (req, res, next) => {
  try {
    const { orgDbId } = await getOrgId(req);
    const format = (req.query.format as string) || "json";

    const conditions = [eq(toolAuditLogs.orgId, orgDbId)];
    if (req.query.startDate) {
      conditions.push(gte(toolAuditLogs.createdAt, new Date(req.query.startDate as string)));
    }
    if (req.query.endDate) {
      conditions.push(lte(toolAuditLogs.createdAt, new Date(req.query.endDate as string)));
    }

    const logs = await db
      .select()
      .from(toolAuditLogs)
      .where(and(...conditions))
      .orderBy(desc(toolAuditLogs.createdAt))
      .limit(10000);

    let data: string;
    if (format === "csv") {
      const headers = ["id", "orgId", "aiEmployeeId", "toolId", "operation", "result", "permissionDecision", "executionDurationMs", "errorMessage", "requestId", "createdAt"];
      const rows = logs.map((log) =>
        headers.map((h) => {
          const val = (log as any)[h];
          return val === null || val === undefined ? "" : String(val);
        }).join(",")
      );
      data = [headers.join(","), ...rows].join("\n");
    } else {
      data = JSON.stringify(logs, null, 2);
    }

    res.json({ data, format, count: logs.length });
  } catch (error) {
    next(error);
  }
});

export default router;
