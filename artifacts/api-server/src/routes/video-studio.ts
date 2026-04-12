import { Router } from "express";
import { db, videoProjects, aiEmployees } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";

const router = Router();

const SEEDANCE_TEMPLATES = [
  {
    id: "consistent-characters",
    title: "Consistent Characters",
    prompt: "{{name}} is wearing a professional suit in an open tech office walking forward. Tracking shot. Script: \"Welcome to our team.\" The scene transitions smoothly to a modern conference room. Professional lighting, cinematic quality.",
    category: "Professional",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/4db63bc961c84f7bb8709b91961f39f5_52230/preview_target.webp",
    duration: 15,
  },
  {
    id: "product-demo",
    title: "Product Demo",
    prompt: "{{name}} is standing in a sleek modern studio with a large screen behind them. They face the camera and present confidently. Slow dolly in from medium to close-up. Studio lighting with subtle lens flare. Cinematic 4K quality.",
    category: "Marketing",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/36ea896236c6453c9587d29e92741154_52310/preview_target.webp",
    duration: 12,
  },
  {
    id: "team-introduction",
    title: "Team Introduction",
    prompt: "{{name}} is sitting at a modern desk in a bright office with plants and natural light. They smile warmly at the camera and introduce themselves. Gentle push-in shot. Warm, inviting lighting.",
    category: "HR & Onboarding",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/bf0bd8403ab441a0afc403d99e751132_52220/preview_target.webp",
    duration: 10,
  },
  {
    id: "dynamic-action",
    title: "Dynamic Action",
    prompt: "{{name}} is in a brightly lit modern workspace. They stand confidently, then walk dynamically toward the camera with purpose. Tracking shot follows them. The scene ends with a close-up smile. High energy, cinematic.",
    category: "Social Media",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/5cedd38b227746ea95edc4a0332c7746_52300/preview_target.webp",
    duration: 10,
  },
  {
    id: "thought-leadership",
    title: "Thought Leadership",
    prompt: "{{name}} is standing on a rooftop terrace overlooking a city skyline at golden hour. They face the camera and speak with authority. Slow orbit shot. Dramatic cinematic lighting with bokeh city lights in the background.",
    category: "Professional",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/4db63bc961c84f7bb8709b91961f39f5_52230/preview_target.webp",
    duration: 12,
  },
  {
    id: "customer-testimonial",
    title: "Customer Testimonial",
    prompt: "{{name}} is seated in a cozy, well-lit interview setting with a blurred modern office background. They speak naturally toward the camera. Static medium shot with shallow depth of field. Warm, authentic feel.",
    category: "Marketing",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/bf0bd8403ab441a0afc403d99e751132_52220/preview_target.webp",
    duration: 10,
  },
  {
    id: "training-video",
    title: "Training Module",
    prompt: "{{name}} is standing in front of a digital whiteboard in a modern training room. They gesture toward the board while explaining. Medium shot with slight pan. Clean, educational lighting.",
    category: "HR & Onboarding",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/36ea896236c6453c9587d29e92741154_52310/preview_target.webp",
    duration: 15,
  },
  {
    id: "social-clip",
    title: "Social Media Clip",
    prompt: "{{name}} is in a vibrant, colorful environment with neon accent lighting. They face the camera with energy and charisma. Quick dynamic cuts between angles. Vertical format optimized. TikTok/Reels style.",
    category: "Social Media",
    thumbnailUrl: "https://files2.heygen.ai/avatar/v3/5cedd38b227746ea95edc4a0332c7746_52300/preview_target.webp",
    duration: 8,
  },
];

const createProjectSchema = z.object({
  prompt: z.string().min(1).max(2000),
  title: z.string().max(200).optional(),
  duration: z.number().int().min(5).max(60).default(10),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  enhance: z.boolean().default(true),
  employeeId: z.number().int().nullable().optional(),
});

async function enrichProject(p: typeof videoProjects.$inferSelect, orgId: number) {
  let employeeName = null;
  let employeeAvatarUrl = null;
  if (p.employeeId) {
    const [emp] = await db.select({ name: aiEmployees.name, avatarUrl: aiEmployees.avatarUrl })
      .from(aiEmployees).where(and(eq(aiEmployees.id, p.employeeId), eq(aiEmployees.orgId, orgId)));
    if (emp) {
      employeeName = emp.name;
      employeeAvatarUrl = emp.avatarUrl;
    }
  }
  return { ...p, employeeName, employeeAvatarUrl };
}

async function pollHeyGenVideo(videoId: string, projectId: number, apiKey: string) {
  const maxAttempts = 120;
  const pollInterval = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { "X-Api-Key": apiKey },
      });

      if (!statusRes.ok) continue;

      const statusData = (await statusRes.json()) as { data?: { status?: string; video_url?: string; thumbnail_url?: string; error?: string } };
      const status = statusData?.data?.status;

      if (status === "completed") {
        await db.update(videoProjects)
          .set({
            status: "completed",
            videoUrl: statusData.data?.video_url || null,
            thumbnailUrl: statusData.data?.thumbnail_url || null,
            completedAt: new Date(),
          })
          .where(eq(videoProjects.id, projectId));
        return;
      }

      if (status === "failed" || status === "error") {
        throw new Error(statusData.data?.error || "HeyGen video generation failed");
      }
    } catch (err) {
      if (attempt === maxAttempts - 1) {
        await db.update(videoProjects)
          .set({
            status: "failed",
            errorMessage: err instanceof Error ? err.message : "Polling timeout — video generation did not complete",
          })
          .where(eq(videoProjects.id, projectId));
      }
    }
  }
}

router.get("/video-studio/projects", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const limit = Math.min(parseInt(String(req.query.limit || "20")), 100);
    const projects = await db.select().from(videoProjects)
      .where(eq(videoProjects.orgId, orgId))
      .orderBy(desc(videoProjects.createdAt))
      .limit(limit);

    const enriched = await Promise.all(projects.map(p => enrichProject(p, orgId)));
    res.json({ data: enriched });
  } catch (error) {
    next(error);
  }
});

router.post("/video-studio/projects", requireAuth, validate({ body: createProjectSchema }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const heygenApiKey = process.env.HEYGEN_API_KEY;
    if (!heygenApiKey) {
      throw AppError.badRequest("HEYGEN_API_KEY is not configured. Video generation requires a valid HeyGen API key.");
    }

    const { prompt, title, duration, aspectRatio, enhance, employeeId } = req.body;

    if (employeeId) {
      const [emp] = await db.select({ id: aiEmployees.id })
        .from(aiEmployees)
        .where(and(eq(aiEmployees.id, employeeId), eq(aiEmployees.orgId, orgId)));
      if (!emp) throw AppError.badRequest("Employee not found in your organization");
    }

    const projectTitle = title || `Video — ${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`;

    const [project] = await db.insert(videoProjects).values({
      orgId,
      title: projectTitle,
      prompt,
      duration,
      aspectRatio,
      enhance,
      status: "queued",
      employeeId: employeeId || null,
    }).returning();

    (async () => {
      try {
        await db.update(videoProjects)
          .set({ status: "generating" })
          .where(eq(videoProjects.id, project.id));

        const dimensionMap: Record<string, { width: number; height: number }> = {
          "16:9": { width: 1920, height: 1080 },
          "9:16": { width: 1080, height: 1920 },
          "1:1": { width: 1080, height: 1080 },
        };

        const response = await fetch("https://api.heygen.com/v2/video/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": heygenApiKey,
          },
          body: JSON.stringify({
            video_inputs: [{
              character: { type: "avatar", avatar_id: "default" },
              voice: { type: "text", input_text: prompt },
            }],
            dimension: dimensionMap[aspectRatio] || dimensionMap["16:9"],
            enhance,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HeyGen API returned ${response.status}: ${errorBody}`);
        }

        const result = (await response.json()) as { data?: { video_id?: string } };
        const heygenVideoId = result.data?.video_id;

        if (!heygenVideoId) {
          throw new Error("HeyGen API did not return a video_id");
        }

        await db.update(videoProjects)
          .set({ heygenVideoId })
          .where(eq(videoProjects.id, project.id));

        await pollHeyGenVideo(heygenVideoId, project.id, heygenApiKey);
      } catch (err) {
        await db.update(videoProjects)
          .set({
            status: "failed",
            errorMessage: err instanceof Error ? err.message : "Video generation failed",
          })
          .where(eq(videoProjects.id, project.id));
      }
    })();

    const enriched = await enrichProject(project, orgId);
    res.status(201).json(enriched);
  } catch (error) {
    next(error);
  }
});

router.get("/video-studio/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const id = parseInt(String(req.params.id));
    const [project] = await db.select().from(videoProjects)
      .where(and(eq(videoProjects.id, id), eq(videoProjects.orgId, orgId)));

    if (!project) throw AppError.notFound("Video project not found");

    const enriched = await enrichProject(project, orgId);
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

router.delete("/video-studio/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const id = parseInt(String(req.params.id));
    const [project] = await db.select().from(videoProjects)
      .where(and(eq(videoProjects.id, id), eq(videoProjects.orgId, orgId)));

    if (!project) throw AppError.notFound("Video project not found");

    await db.delete(videoProjects).where(eq(videoProjects.id, id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/video-studio/templates", requireAuth, async (_req, res) => {
  res.json({ data: SEEDANCE_TEMPLATES });
});

export default router;
