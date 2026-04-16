import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { promptTemplates, promptAuditLogs } from "@workspace/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { getAuthContext } from "../lib/auth-helpers";
import { assemblePrompt } from "../lib/promptAssembler";
import { redactPII } from "../lib/promptValidator";

const router = Router();

router.get("/prompts/templates", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const layer = req.query.layer as string | undefined;
    const roleId = req.query.roleId ? parseInt(req.query.roleId as string, 10) : undefined;

    const conditions = [eq(promptTemplates.orgId, orgId), eq(promptTemplates.isActive, 1)];
    if (layer) conditions.push(eq(promptTemplates.layer, layer));

    let templates = await db
      .select()
      .from(promptTemplates)
      .where(and(...conditions))
      .orderBy(desc(promptTemplates.updatedAt));

    if (roleId) {
      templates = templates.filter(t => t.roleId === roleId || t.roleId === null);
    }

    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
});

router.get("/prompts/templates/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw AppError.badRequest("Invalid template ID");

    const [template] = await db
      .select()
      .from(promptTemplates)
      .where(and(eq(promptTemplates.id, id), eq(promptTemplates.orgId, orgId)))
      .limit(1);

    if (!template) throw AppError.notFound("Template not found");

    res.json(template);
  } catch (error) {
    next(error);
  }
});

const createTemplateBody = z.object({
  name: z.string().min(1).max(200),
  layer: z.enum(["system", "role_definition", "job_instructions", "task_instructions", "memory_context", "user_context", "company_context", "tool_access", "compliance"]),
  content: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  roleId: z.number().optional(),
  variant: z.string().min(1).max(100).optional(),
  trafficWeight: z.number().min(0).max(100).optional(),
});

router.post("/prompts/templates", requireAuth, validate({ body: createTemplateBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const variant = req.body.variant || "default";
    const roleId = req.body.roleId || null;

    const conditions = [
      eq(promptTemplates.orgId, orgId),
      eq(promptTemplates.name, req.body.name),
      eq(promptTemplates.layer, req.body.layer),
      eq(promptTemplates.variant, variant),
      roleId ? eq(promptTemplates.roleId, roleId) : isNull(promptTemplates.roleId),
    ];

    const existing = await db
      .select()
      .from(promptTemplates)
      .where(and(...conditions))
      .orderBy(desc(promptTemplates.version))
      .limit(1);

    const version = existing.length > 0 ? existing[0].version + 1 : 1;

    if (existing.length > 0) {
      await db
        .update(promptTemplates)
        .set({ isActive: 0, updatedAt: new Date() })
        .where(eq(promptTemplates.id, existing[0].id));
    }

    const [template] = await db
      .insert(promptTemplates)
      .values({
        orgId,
        name: req.body.name,
        layer: req.body.layer,
        version,
        content: req.body.content,
        variables: req.body.variables || null,
        metadata: req.body.metadata || null,
        roleId,
        variant,
        trafficWeight: req.body.trafficWeight ?? 100,
      })
      .returning();

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

const updateTemplateBody = z.object({
  content: z.string().min(1).optional(),
  variables: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.number().min(0).max(1).optional(),
  variant: z.string().min(1).max(100).optional(),
  trafficWeight: z.number().min(0).max(100).optional(),
});

router.put("/prompts/templates/:id", requireAuth, validate({ body: updateTemplateBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw AppError.badRequest("Invalid template ID");

    const [existing] = await db
      .select()
      .from(promptTemplates)
      .where(and(eq(promptTemplates.id, id), eq(promptTemplates.orgId, orgId)))
      .limit(1);

    if (!existing) throw AppError.notFound("Template not found");

    if (req.body.isActive !== undefined && !req.body.content) {
      const [updated] = await db
        .update(promptTemplates)
        .set({ isActive: req.body.isActive, updatedAt: new Date() })
        .where(eq(promptTemplates.id, id))
        .returning();
      return res.json(updated);
    }

    await db
      .update(promptTemplates)
      .set({ isActive: 0, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id));

    const [newVersion] = await db
      .insert(promptTemplates)
      .values({
        orgId: existing.orgId,
        name: existing.name,
        layer: existing.layer,
        version: existing.version + 1,
        content: req.body.content || existing.content,
        variables: req.body.variables !== undefined ? req.body.variables : existing.variables,
        metadata: req.body.metadata !== undefined ? req.body.metadata : existing.metadata,
        roleId: existing.roleId,
        variant: req.body.variant || existing.variant,
        trafficWeight: req.body.trafficWeight ?? existing.trafficWeight,
        isActive: 1,
      })
      .returning();

    res.json(newVersion);
  } catch (error) {
    next(error);
  }
});

const assembleBody = z.object({
  aiEmployeeId: z.number(),
  conversationId: z.number().optional(),
  currentMessage: z.string().max(10000).optional(),
  activeTask: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.string().optional(),
    dueDate: z.string().optional(),
    steps: z.array(z.string()).optional(),
    expectedOutputs: z.array(z.string()).optional(),
    successCriteria: z.array(z.string()).optional(),
  }).optional(),
  tokenBudget: z.number().min(1000).max(200000).optional(),
  contextOverrides: z.record(z.string(), z.string()).optional(),
});

router.post("/prompts/assemble", requireAuth, validate({ body: assembleBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden("Authentication required");

    const assembled = await assemblePrompt({
      aiEmployeeId: req.body.aiEmployeeId,
      orgId,
      userId,
      conversationId: req.body.conversationId,
      currentMessage: req.body.currentMessage,
      activeTask: req.body.activeTask,
      tokenBudget: req.body.tokenBudget,
      contextOverrides: req.body.contextOverrides,
    });

    res.json({
      systemPrompt: assembled.systemPrompt,
      tokenCount: assembled.tokenCount,
      tokenBudget: assembled.tokenBudget,
      truncations: assembled.truncations,
      validation: assembled.validation,
      metadata: assembled.metadata,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/prompts/preview", requireAuth, validate({ body: assembleBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden("Authentication required");

    const assembled = await assemblePrompt({
      aiEmployeeId: req.body.aiEmployeeId,
      orgId,
      userId,
      conversationId: req.body.conversationId,
      currentMessage: req.body.currentMessage,
      activeTask: req.body.activeTask,
      tokenBudget: req.body.tokenBudget,
      contextOverrides: req.body.contextOverrides,
      skipAudit: true,
    });

    res.json({
      layers: Object.fromEntries(
        Object.entries(assembled.layers).map(([k, v]) => [k, {
          content: redactPII(v),
          tokens: Math.ceil((v?.length || 0) / 3.5),
          truncated: assembled.truncations.some(t => t.layer === k),
        }]),
      ),
      totalTokens: assembled.tokenCount,
      tokenBudget: assembled.tokenBudget,
      validation: assembled.validation,
      metadata: assembled.metadata,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/prompts/audit-logs", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 200);
    const aiEmployeeId = req.query.aiEmployeeId ? parseInt(req.query.aiEmployeeId as string, 10) : undefined;

    const conditions = [eq(promptAuditLogs.orgId, orgId)];
    if (aiEmployeeId) {
      conditions.push(eq(promptAuditLogs.aiEmployeeId, aiEmployeeId));
    }

    const logs = await db
      .select({
        id: promptAuditLogs.id,
        aiEmployeeId: promptAuditLogs.aiEmployeeId,
        templateVersion: promptAuditLogs.templateVersion,
        layersSummary: promptAuditLogs.layersSummary,
        assembledPromptHash: promptAuditLogs.assembledPromptHash,
        tokenCount: promptAuditLogs.tokenCount,
        tokenBudget: promptAuditLogs.tokenBudget,
        truncationApplied: promptAuditLogs.truncationApplied,
        validationResult: promptAuditLogs.validationResult,
        assemblyDurationMs: promptAuditLogs.assemblyDurationMs,
        createdAt: promptAuditLogs.createdAt,
      })
      .from(promptAuditLogs)
      .where(and(...conditions))
      .orderBy(desc(promptAuditLogs.createdAt))
      .limit(limit);

    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
});

router.get("/prompts/audit-logs/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw AppError.badRequest("Invalid log ID");

    const [log] = await db
      .select()
      .from(promptAuditLogs)
      .where(and(eq(promptAuditLogs.id, id), eq(promptAuditLogs.orgId, orgId)))
      .limit(1);

    if (!log) throw AppError.notFound("Audit log not found");

    res.json(log);
  } catch (error) {
    next(error);
  }
});

export default router;
