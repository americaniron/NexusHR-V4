import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { generateAvatar, getDiceBearFallback } from "../lib/avatars";
import { AppError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { db, aiEmployees } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const GALLERY_STYLES = ["notionists", "avataaars", "bottts", "lorelei", "micah", "thumbs", "fun-emoji", "personas"];
const GALLERY_SEEDS = [
  "executive-ceo", "tech-lead", "data-scientist", "marketing-director",
  "finance-analyst", "hr-manager", "sales-rep", "designer-creative",
  "ops-manager", "legal-counsel", "customer-success", "product-manager",
  "dev-ops-engineer", "content-writer", "research-analyst", "qa-engineer",
  "security-specialist", "project-manager", "business-analyst", "ux-researcher",
  "cloud-architect", "ai-engineer", "growth-hacker", "compliance-officer",
];

router.get("/avatars/gallery", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const category = _req.query.category as string | undefined;
    const industry = _req.query.industry as string | undefined;

    const gallery = GALLERY_SEEDS.map((seed, index) => {
      const style = GALLERY_STYLES[index % GALLERY_STYLES.length];
      return {
        id: `dicebear-${seed}`,
        url: getDiceBearFallback(seed, style),
        label: seed.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        category: category || "general",
        industry: industry || "technology",
      };
    });

    res.json({ data: gallery, total: gallery.length });
  } catch (error) {
    next(error);
  }
});

router.post("/avatars/generate", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleTitle, industry, seniority, gender, ethnicity, attireStyle, seed } = req.body || {};

    const result = await generateAvatar({
      roleTitle,
      industry,
      seniority,
      gender,
      ethnicity,
      attireStyle,
      seed,
    });

    res.json(result);
  } catch (error) {
    console.error("[Avatars] Generation failed:", error instanceof Error ? error.message : error);
    const fallbackSeed = req.body?.seed || req.body?.roleTitle || "default";
    res.status(500).json({
      avatarUrl: getDiceBearFallback(fallbackSeed),
      objectPath: "",
      prompt: "Fallback to DiceBear avatar - generation failed",
      error: "Avatar generation failed",
    });
  }
});

router.post("/avatars/regenerate/:employeeId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
    const employeeId = parseInt(rawId, 10);
    if (isNaN(employeeId)) {
      throw AppError.badRequest("Invalid employee ID");
    }

    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      throw AppError.forbidden("Organization context required");
    }

    const [employee] = await db
      .select()
      .from(aiEmployees)
      .where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.organizationId, orgId)))
      .limit(1);

    if (!employee) {
      throw AppError.notFound("Employee not found");
    }

    const { roleTitle, industry, seniority, gender, ethnicity, attireStyle } = req.body || {};

    const result = await generateAvatar({
      roleTitle: roleTitle || employee.name,
      industry,
      seniority,
      gender,
      ethnicity,
      attireStyle,
      seed: `employee-${employeeId}-${Date.now()}`,
    });

    await db.update(aiEmployees).set({ avatarUrl: result.avatarUrl }).where(eq(aiEmployees.id, employeeId));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
