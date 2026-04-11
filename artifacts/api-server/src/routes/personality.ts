import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { aiEmployees, organizations, relationalMemories } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { getAuthContext } from "../lib/auth-helpers";
import {
  generateCommunicationStyle,
  generatePersonalityPrompt,
  generatePreviewText,
  validatePersonalityAxes,
  PERSONALITY_PRESETS,
  AXIS_LABELS,
  DEFAULT_PERSONALITY,
} from "../lib/personalityEngine";
import { computeToneAdjustment, analyzeSentiment } from "../lib/toneController";
import { generateCulturePrompt, validateCultureProfile } from "../lib/cultureAlignment";
import { assessPriority } from "../lib/priorityIntelligence";
import { storeMemory, retrieveMemories, deleteMemory, formatMemoriesForPrompt, type MemoryType } from "../lib/relationalMemory";

const router = Router();

const personalityAxesSchema = z.object({
  warmth: z.number().min(0).max(1),
  formality: z.number().min(0).max(1),
  assertiveness: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  empathy: z.number().min(0).max(1),
  detailOrientation: z.number().min(0).max(1),
  humor: z.number().min(0).max(1),
});

async function verifyEmployeeBelongsToOrg(employeeId: number, orgId: number) {
  const [employee] = await db
    .select()
    .from(aiEmployees)
    .where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.orgId, orgId)))
    .limit(1);
  if (!employee) throw AppError.notFound("Employee not found");
  return employee;
}

router.get("/personality/presets", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: PERSONALITY_PRESETS,
      axisLabels: AXIS_LABELS,
      defaults: DEFAULT_PERSONALITY,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/personality/employee/:employeeId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const employeeId = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) throw AppError.badRequest("Invalid employee ID");

    const employee = await verifyEmployeeBelongsToOrg(employeeId, orgId);

    const axes = validatePersonalityAxes(employee.personality);
    const style = generateCommunicationStyle(axes);
    const previewText = generatePreviewText(axes);

    res.json({
      employeeId: employee.id,
      name: employee.name,
      personality: axes,
      communicationStyle: style,
      previewText,
    });
  } catch (error) {
    next(error);
  }
});

const updatePersonalityBody = z.object({
  personality: personalityAxesSchema,
});

router.put("/personality/employee/:employeeId", requireAuth, validate({ body: updatePersonalityBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const employeeId = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) throw AppError.badRequest("Invalid employee ID");

    await verifyEmployeeBelongsToOrg(employeeId, orgId);

    const validatedAxes = validatePersonalityAxes(req.body.personality);

    const [updated] = await db
      .update(aiEmployees)
      .set({
        personality: validatedAxes,
        updatedAt: new Date(),
      })
      .where(eq(aiEmployees.id, employeeId))
      .returning();

    const style = generateCommunicationStyle(validatedAxes);
    const previewText = generatePreviewText(validatedAxes);

    res.json({
      employeeId: updated.id,
      name: updated.name,
      personality: validatedAxes,
      communicationStyle: style,
      previewText,
    });
  } catch (error) {
    next(error);
  }
});

const generateStyleBody = z.object({
  personality: personalityAxesSchema,
  context: z.object({
    recentMessages: z.array(z.object({
      role: z.string(),
      content: z.string(),
    })).optional(),
    taskUrgency: z.enum(["low", "medium", "high", "critical"]).optional(),
    interactionCount: z.number().optional(),
  }).optional(),
});

router.post("/personality/generate-style", requireAuth, validate({ body: generateStyleBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { personality, context } = req.body;
    const axes = validatePersonalityAxes(personality);

    const personalityPrompt = generatePersonalityPrompt(axes);

    let toneAdjustment = null;
    if (context?.recentMessages) {
      toneAdjustment = computeToneAdjustment(axes, {
        recentMessages: context.recentMessages,
        taskUrgency: context.taskUrgency,
        interactionCount: context.interactionCount,
      });
    }

    const style = generateCommunicationStyle(axes);
    const previewText = generatePreviewText(axes);

    res.json({
      personalityPrompt,
      toneAdjustment,
      communicationStyle: style,
      previewText,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/personality/analyze-sentiment", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw AppError.badRequest("Messages array required");

    const sentiment = analyzeSentiment(messages);
    res.json({ sentiment });
  } catch (error) {
    next(error);
  }
});

const cultureProfileSchema = z.object({
  formalityBaseline: z.number().min(0).max(1).optional(),
  industryTerminology: z.array(z.string().max(100)).max(50).optional(),
  valuesEmphasis: z.array(z.string().max(200)).max(20).optional(),
  communicationNorms: z.array(z.string().max(500)).max(20).optional(),
  tonePreference: z.enum(["professional", "casual", "inspirational", "technical"]).optional(),
  industryContext: z.string().max(500).optional(),
});

router.get("/personality/culture", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) throw AppError.notFound("Organization not found");

    const culture = validateCultureProfile(org.cultureProfile);
    const prompt = generateCulturePrompt(culture);

    res.json({ culture, prompt });
  } catch (error) {
    next(error);
  }
});

router.put("/personality/culture", requireAuth, validate({ body: cultureProfileSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden("Organization required");

    const validated = validateCultureProfile(req.body);

    await db
      .update(organizations)
      .set({
        cultureProfile: validated,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId));

    const prompt = generateCulturePrompt(validated);
    res.json({ culture: validated, prompt });
  } catch (error) {
    next(error);
  }
});

const storeMemoryBody = z.object({
  aiEmployeeId: z.number(),
  memoryType: z.enum(["preference", "personal_context", "interaction_pattern"]),
  category: z.string().max(100).optional(),
  content: z.string().min(1).max(2000),
  relevanceScore: z.number().min(0).max(1).optional(),
});

router.post("/personality/memories", requireAuth, validate({ body: storeMemoryBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden("Authentication required");

    const { aiEmployeeId, memoryType, category, content, relevanceScore } = req.body;

    await verifyEmployeeBelongsToOrg(aiEmployeeId, orgId);

    const memory = await storeMemory(orgId, userId, aiEmployeeId, {
      memoryType: memoryType as MemoryType,
      category,
      content,
      relevanceScore,
    });

    res.status(201).json(memory);
  } catch (error) {
    next(error);
  }
});

router.get("/personality/memories/:aiEmployeeId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden("Authentication required");

    const aiEmployeeId = parseInt(req.params.aiEmployeeId, 10);
    if (isNaN(aiEmployeeId)) throw AppError.badRequest("Invalid employee ID");

    await verifyEmployeeBelongsToOrg(aiEmployeeId, orgId);

    const memoryType = req.query.type as MemoryType | undefined;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

    const memories = await retrieveMemories(userId, aiEmployeeId, {
      limit,
      memoryType,
    });

    const prompt = formatMemoriesForPrompt(memories);

    res.json({ data: memories, prompt });
  } catch (error) {
    next(error);
  }
});

router.delete("/personality/memories/:memoryId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.forbidden("Authentication required");

    const memoryId = parseInt(req.params.memoryId, 10);
    if (isNaN(memoryId)) throw AppError.badRequest("Invalid memory ID");

    const [memory] = await db
      .select()
      .from(relationalMemories)
      .where(eq(relationalMemories.id, memoryId))
      .limit(1);

    if (!memory) throw AppError.notFound("Memory not found");
    if (memory.userId !== userId) throw AppError.forbidden("Not authorized");

    const [employee] = await db
      .select()
      .from(aiEmployees)
      .where(and(eq(aiEmployees.id, memory.aiEmployeeId), eq(aiEmployees.orgId, orgId)))
      .limit(1);
    if (!employee) throw AppError.forbidden("Not authorized");

    await deleteMemory(memoryId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const priorityBody = z.object({
  rolePriorities: z.array(z.string()).optional(),
  taskQueue: z.array(z.object({
    id: z.number(),
    title: z.string(),
    priority: z.string(),
    dueDate: z.string().optional(),
    status: z.string(),
  })).optional(),
  orgPriorityMatrix: z.record(z.string(), z.number()).optional(),
  slaDefinitions: z.array(z.object({
    category: z.string(),
    responseTimeMinutes: z.number(),
    resolutionTimeMinutes: z.number(),
  })).optional(),
});

router.post("/personality/assess-priority", requireAuth, validate({ body: priorityBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = assessPriority(req.body);
    res.json(assessment);
  } catch (error) {
    next(error);
  }
});

export default router;
