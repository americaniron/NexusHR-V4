import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { generateAvatar, getDiceBearFallback, type AvatarIdentityPackage } from "../lib/avatars";
import { AppError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { validate, idParam } from "../middlewares/validate";
import { getAuthContext } from "../lib/auth-helpers";
import { db, aiEmployees, aiEmployeeRoles } from "@workspace/db";
import { eq, and, isNotNull, ilike } from "drizzle-orm";

const avatarGenerateLimit = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "avatar-generate" });
const avatarRegenerateLimit = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "avatar-regenerate" });

const router: IRouter = Router();

const ENTERPRISE_BRANDING_PRESETS: Record<string, { attireOptions: string[]; colorPalette: string; description: string }> = {
  corporate: {
    attireOptions: ["formal", "business-casual"],
    colorPalette: "navy, charcoal, white",
    description: "Classic corporate branding — suits, blazers, neutral tones",
  },
  startup: {
    attireOptions: ["casual", "creative", "business-casual"],
    colorPalette: "bright, modern, vibrant",
    description: "Startup culture — hoodies, smart casual, modern vibes",
  },
  creative: {
    attireOptions: ["creative", "casual"],
    colorPalette: "bold, artistic, expressive",
    description: "Creative agency — fashion-forward, artistic, bold",
  },
  professional: {
    attireOptions: ["formal", "business-casual"],
    colorPalette: "classic, muted, professional",
    description: "Professional services — polished, refined, trustworthy",
  },
};

const galleryQuery = z.object({
  roleTitle: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
});

const genderEnum = z.enum(["male", "female", "non-binary"]);
const ageRangeEnum = z.enum(["20-30", "30-40", "40-50", "50-60", "60+"]);
const attireEnum = z.enum(["formal", "business-casual", "casual", "creative"]);
const safeStringPattern = /^[a-zA-Z0-9 \-_.,()&]+$/;

const generateBody = z.object({
  roleTitle: z.string().max(200).regex(safeStringPattern).optional(),
  industry: z.string().max(100).regex(safeStringPattern).optional(),
  seniority: z.string().max(50).regex(safeStringPattern).optional(),
  gender: genderEnum.optional(),
  ageRange: ageRangeEnum.optional(),
  ethnicity: z.string().max(100).regex(safeStringPattern).optional(),
  attireStyle: attireEnum.optional(),
  seed: z.string().max(64).regex(/^[a-zA-Z0-9\-_]+$/).optional(),
  brandingPreset: z.enum(["corporate", "startup", "creative", "professional"]).optional(),
});

const regenerateBody = z.object({
  roleTitle: z.string().max(200).regex(safeStringPattern).optional(),
  industry: z.string().max(100).regex(safeStringPattern).optional(),
  seniority: z.string().max(50).regex(safeStringPattern).optional(),
  gender: genderEnum.optional(),
  ageRange: ageRangeEnum.optional(),
  ethnicity: z.string().max(100).regex(safeStringPattern).optional(),
  attireStyle: attireEnum.optional(),
});

router.get("/avatars/gallery", validate({ query: galleryQuery }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleTitle = req.query.roleTitle as string | undefined;
    const category = req.query.category as string | undefined;
    const industry = req.query.industry as string | undefined;

    const gallery: { id: string; url: string; label: string; category: string; industry: string }[] = [];

    if (roleTitle) {
      const matchingRoles = await db
        .select({ id: aiEmployeeRoles.id, title: aiEmployeeRoles.title, avatarUrl: aiEmployeeRoles.avatarUrl, industry: aiEmployeeRoles.industry })
        .from(aiEmployeeRoles)
        .where(and(isNotNull(aiEmployeeRoles.avatarUrl), ilike(aiEmployeeRoles.title, `%${roleTitle}%`)))
        .limit(12);

      for (const role of matchingRoles) {
        if (role.avatarUrl) {
          gallery.push({
            id: `role-${role.id}`,
            url: role.avatarUrl,
            label: role.title,
            category: "role-match",
            industry: role.industry,
          });
        }
      }
    }

    if (industry) {
      const industryRoles = await db
        .select({ id: aiEmployeeRoles.id, title: aiEmployeeRoles.title, avatarUrl: aiEmployeeRoles.avatarUrl, industry: aiEmployeeRoles.industry })
        .from(aiEmployeeRoles)
        .where(and(isNotNull(aiEmployeeRoles.avatarUrl), ilike(aiEmployeeRoles.industry, `%${industry}%`)))
        .limit(12);

      for (const role of industryRoles) {
        if (role.avatarUrl && !gallery.some(g => g.id === `role-${role.id}`)) {
          gallery.push({
            id: `role-${role.id}`,
            url: role.avatarUrl,
            label: role.title,
            category: "industry-match",
            industry: role.industry,
          });
        }
      }
    }

    if (gallery.length === 0) {
      const allRoles = await db
        .select({ id: aiEmployeeRoles.id, title: aiEmployeeRoles.title, avatarUrl: aiEmployeeRoles.avatarUrl, industry: aiEmployeeRoles.industry })
        .from(aiEmployeeRoles)
        .where(isNotNull(aiEmployeeRoles.avatarUrl))
        .limit(24);

      for (const role of allRoles) {
        if (role.avatarUrl) {
          gallery.push({
            id: `role-${role.id}`,
            url: role.avatarUrl,
            label: role.title,
            category: category || "general",
            industry: role.industry,
          });
        }
      }
    }

    if (gallery.length === 0) {
      const FALLBACK_STYLES = ["notionists", "avataaars", "bottts", "lorelei", "micah", "personas"];
      const FALLBACK_SEEDS = [
        "executive-ceo", "tech-lead", "data-scientist", "marketing-director",
        "finance-analyst", "hr-manager", "sales-rep", "designer-creative",
      ];
      for (let i = 0; i < FALLBACK_SEEDS.length; i++) {
        gallery.push({
          id: `fallback-${FALLBACK_SEEDS[i]}`,
          url: getDiceBearFallback(FALLBACK_SEEDS[i], FALLBACK_STYLES[i % FALLBACK_STYLES.length]),
          label: FALLBACK_SEEDS[i].split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          category: "fallback",
          industry: industry || "technology",
        });
      }
    }

    res.json({ data: gallery, total: gallery.length });
  } catch (error) {
    next(error);
  }
});

router.get("/avatars/branding-presets", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: ENTERPRISE_BRANDING_PRESETS });
  } catch (error) {
    next(error);
  }
});

router.post("/avatars/generate", requireAuth, avatarGenerateLimit, validate({ body: generateBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleTitle, industry, seniority, gender, ageRange, ethnicity, attireStyle, seed, brandingPreset } = req.body || {};

    let resolvedAttire = attireStyle;
    if (brandingPreset && ENTERPRISE_BRANDING_PRESETS[brandingPreset]) {
      const preset = ENTERPRISE_BRANDING_PRESETS[brandingPreset];
      if (!resolvedAttire) {
        resolvedAttire = preset.attireOptions[0];
      }
    }

    const result = await generateAvatar({
      roleTitle,
      industry,
      seniority,
      gender,
      ageRange,
      ethnicity,
      attireStyle: resolvedAttire,
      seed,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

const employeeIdParam = z.object({
  employeeId: z.coerce.number().int().min(1),
});

router.post("/avatars/regenerate/:employeeId", requireAuth, avatarRegenerateLimit, validate({ params: employeeIdParam, body: regenerateBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = Number(req.params.employeeId);

    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      throw AppError.forbidden("Organization context required");
    }

    const [employee] = await db
      .select()
      .from(aiEmployees)
      .where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.orgId, orgId)))
      .limit(1);

    if (!employee) {
      throw AppError.notFound("Employee not found");
    }

    const { roleTitle, industry, seniority, gender, ageRange, ethnicity, attireStyle } = req.body || {};

    const result = await generateAvatar({
      roleTitle: roleTitle || employee.name,
      industry,
      seniority,
      gender,
      ageRange,
      ethnicity,
      attireStyle,
      seed: `employee-${employeeId}-${Date.now()}`,
    });

    const aip: AvatarIdentityPackage = {
      ...result.identityPackage,
      voiceId: employee.voiceId || undefined,
    };

    await db.update(aiEmployees).set({
      avatarUrl: result.avatarUrl,
      avatarConfig: aip,
    }).where(eq(aiEmployees.id, employeeId));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
