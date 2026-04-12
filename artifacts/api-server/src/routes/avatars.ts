import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { generateAvatar, getDiceBearFallback, runStyleGAN3Pipeline, type AvatarIdentityPackage } from "../lib/avatars";
import {
  SUPPORTED_ETHNICITIES,
  SUPPORTED_EYE_SHAPES,
  SUPPORTED_NOSE_SHAPES,
  SUPPORTED_FACIAL_HAIR,
  SUPPORTED_GLASSES,
  SUPPORTED_HAIR_STYLES_MALE,
  SUPPORTED_HAIR_STYLES_FEMALE,
  SUPPORTED_HAIR_COLORS,
} from "../lib/styleGAN3Pipeline";
import { AppError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { validate, idParam } from "../middlewares/validate";
import { getAuthContext } from "../lib/auth-helpers";
import { db, aiEmployees, aiEmployeeRoles, avatarAssets } from "@workspace/db";
import { eq, and, isNotNull, ilike, desc } from "drizzle-orm";
import { requirePlanLimit } from "../middlewares/planLimits";
import { recordUsage } from "../lib/billing/metering";

const avatarGenerateLimit = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "avatar-generate" });
const avatarRegenerateLimit = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "avatar-regenerate" });
const pipelineLimit = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "avatar-pipeline" });

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

const pipelineGenderEnum = z.enum(["male", "female", "non-binary", "androgynous"]);
const pipelineAgeEnum = z.enum(["22-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60", "61-65"]);
const pipelineBodyTypeEnum = z.enum(["slim", "average", "athletic", "plus-size"]);
const pipelineFaceShapeEnum = z.enum(["oval", "round", "square", "heart", "oblong", "diamond"]);
const pipelineHairTextureEnum = z.enum(["straight", "wavy", "curly", "coily", "locs"]);
const pipelineLipShapeEnum = z.enum(["thin", "medium", "full", "wide", "cupids-bow", "heart"]);
const pipelineJawlineEnum = z.enum(["soft", "angular", "defined", "wide", "narrow"]);
const pipelineMakeupEnum = z.enum(["none", "minimal", "professional", "polished"]);
const pipelineAttireEnum = z.enum(["corporate-formal", "business-casual", "smart-casual", "creative", "medical", "technical", "legal"]);
const pipelineBackgroundEnum = z.enum(["modern-office", "home-office", "neutral-gradient", "blurred-professional", "custom"]);
const pipelineBackgroundThemeEnum = z.enum(["light", "dark", "brand-colors", "neutral"]);
const pipelineHeightEnum = z.enum(["short", "average", "tall"]);

const pipelineBody = z.object({
  gender: pipelineGenderEnum,
  ethnicity: z.string().max(100),
  ethnicityBlend: z.string().max(100).optional(),
  ageRange: pipelineAgeEnum,
  bodyType: pipelineBodyTypeEnum.optional(),
  faceShape: pipelineFaceShapeEnum.optional(),
  eyeShape: z.string().max(50).optional(),
  eyeColor: z.string().max(50).optional(),
  noseShape: z.string().max(50).optional(),
  lipShape: pipelineLipShapeEnum.optional(),
  jawline: pipelineJawlineEnum.optional(),
  facialHair: z.string().max(50).optional(),
  makeup: pipelineMakeupEnum.optional(),
  accessories: z.array(z.string().max(50)).max(5).optional(),
  hairStyle: z.string().max(100).optional(),
  hairTexture: pipelineHairTextureEnum.optional(),
  hairColor: z.string().max(50).optional(),
  heightImpression: pipelineHeightEnum.optional(),
  attireCategory: pipelineAttireEnum.optional(),
  attirePrimaryColor: z.string().max(50).optional(),
  outfit: z.string().max(200).optional(),
  attireAccessories: z.array(z.string().max(50)).max(5).optional(),
  backgroundSetting: pipelineBackgroundEnum.optional(),
  backgroundColorTheme: pipelineBackgroundThemeEnum.optional(),
  skinTone: z.number().min(1).max(6).optional(),
  employeeId: z.number().int().min(1).optional(),
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

router.get("/avatars/attribute-options", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: {
        genders: ["male", "female", "non-binary", "androgynous"],
        ethnicities: SUPPORTED_ETHNICITIES,
        ageRanges: ["22-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60", "61-65"],
        bodyTypes: ["slim", "average", "athletic", "plus-size"],
        faceShapes: ["oval", "round", "square", "heart", "oblong", "diamond"],
        eyeShapes: SUPPORTED_EYE_SHAPES,
        eyeColors: ["brown", "blue", "green", "hazel", "gray", "amber", "honey", "dark-brown", "light-blue", "emerald", "violet", "black", "copper", "gold"],
        noseShapes: SUPPORTED_NOSE_SHAPES,
        lipShapes: ["thin", "medium", "full", "wide", "cupids-bow", "heart"],
        jawlines: ["soft", "angular", "defined", "wide", "narrow"],
        facialHair: SUPPORTED_FACIAL_HAIR,
        makeupLevels: ["none", "minimal", "professional", "polished"],
        glasses: SUPPORTED_GLASSES,
        hairStylesMale: SUPPORTED_HAIR_STYLES_MALE,
        hairStylesFemale: SUPPORTED_HAIR_STYLES_FEMALE,
        hairTextures: ["straight", "wavy", "curly", "coily", "locs"],
        hairColors: SUPPORTED_HAIR_COLORS,
        heightImpressions: ["short", "average", "tall"],
        attireCategories: ["corporate-formal", "business-casual", "smart-casual", "creative", "medical", "technical", "legal"],
        backgroundSettings: ["modern-office", "home-office", "neutral-gradient", "blurred-professional", "custom"],
        backgroundThemes: ["light", "dark", "brand-colors", "neutral"],
        skinToneRange: { min: 1, max: 6, description: "Fitzpatrick scale I-VI" },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/avatars/pipeline/generate", requireAuth, requirePlanLimit("avatars"), pipelineLimit, validate({ body: pipelineBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    const { employeeId, ...attributeParams } = req.body;

    const result = await runStyleGAN3Pipeline(attributeParams, {
      orgId: orgId ?? undefined,
      employeeId,
    });

    if (employeeId && orgId) {
      const [employee] = await db
        .select()
        .from(aiEmployees)
        .where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.orgId, orgId)))
        .limit(1);

      if (employee) {
        await db.update(aiEmployees).set({
          avatarUrl: result.avatarUrl,
          avatarConfig: result.identityPackage as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        }).where(eq(aiEmployees.id, employeeId));
      }
    }

    if (orgId) {
      await recordUsage(orgId, "avatars", 1, { pipeline: "stylegan3", qualityScore: result.qualityScore });
    }

    res.json({
      data: {
        avatarUrl: result.avatarUrl,
        assetId: result.assetId,
        qualityScore: result.qualityScore,
        isUnique: result.isUnique,
        perceptualHash: result.perceptualHash,
        attributeVector: {
          hash: result.attributeVector.hash,
          dimensions: result.attributeVector.dimensions.length,
        },
        pipeline: {
          stages: result.pipelineStages,
          totalDurationMs: result.totalDurationMs,
          model: "stylegan3-finetuned-v2",
        },
        identityPackage: {
          version: result.identityPackage.version,
          renderConfig: result.identityPackage.renderConfig,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/avatars/pipeline/assets", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      throw AppError.forbidden("Organization context required");
    }

    const assets = await db
      .select({
        id: avatarAssets.id,
        version: avatarAssets.version,
        status: avatarAssets.status,
        faceImageUrl: avatarAssets.faceImageUrl,
        qualityScore: avatarAssets.qualityScore,
        perceptualHash: avatarAssets.perceptualHash,
        isPreGenerated: avatarAssets.isPreGenerated,
        employeeId: avatarAssets.employeeId,
        createdAt: avatarAssets.createdAt,
      })
      .from(avatarAssets)
      .where(eq(avatarAssets.orgId, orgId))
      .orderBy(desc(avatarAssets.createdAt))
      .limit(50);

    res.json({ data: assets, total: assets.length });
  } catch (error) {
    next(error);
  }
});

router.get("/avatars/pipeline/assets/:assetId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assetId = Number(req.params.assetId);
    if (isNaN(assetId) || assetId < 1) {
      throw AppError.badRequest("Invalid asset ID");
    }

    const { orgId } = await getAuthContext(req);
    if (!orgId) {
      throw AppError.forbidden("Organization context required");
    }

    const [asset] = await db
      .select()
      .from(avatarAssets)
      .where(and(eq(avatarAssets.id, assetId), eq(avatarAssets.orgId, orgId)))
      .limit(1);

    if (!asset) {
      throw AppError.notFound("Avatar asset not found");
    }

    res.json({ data: asset });
  } catch (error) {
    next(error);
  }
});

router.post("/avatars/generate", requireAuth, requirePlanLimit("avatars"), avatarGenerateLimit, validate({ body: generateBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = await getAuthContext(req);
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

    if (orgId) {
      await recordUsage(orgId, "avatars", 1, { roleTitle, industry });
    }

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

    const [employeeRole] = await db
      .select({ title: aiEmployeeRoles.title, industry: aiEmployeeRoles.industry, seniorityLevel: aiEmployeeRoles.seniorityLevel })
      .from(aiEmployeeRoles)
      .where(eq(aiEmployeeRoles.id, employee.roleId))
      .limit(1);

    const { roleTitle, industry, seniority, gender, ageRange, ethnicity, attireStyle } = req.body || {};

    const result = await generateAvatar({
      roleTitle: roleTitle || employeeRole?.title || employee.name,
      industry: industry || employeeRole?.industry,
      seniority: seniority || employeeRole?.seniorityLevel,
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
      avatarConfig: aip as unknown as Record<string, unknown>,
    }).where(eq(aiEmployees.id, employeeId));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
