import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { textToSpeech } from "../lib/elevenlabs";
import { personalityToVoiceSettings, resolveVoiceProfile, type PersonalityAxes } from "../lib/voiceConfig";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";

const router = Router();

const synthesizeLimit = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "voice-synthesize" });
const transcribeLimit = rateLimit({ windowMs: 60_000, max: 15, keyPrefix: "voice-transcribe" });

const synthesizeBody = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().max(100).optional(),
  roleTitle: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  personality: z.object({
    energy: z.number().min(0).max(1).optional(),
    formality: z.number().min(0).max(1).optional(),
    warmth: z.number().min(0).max(1).optional(),
  }).optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
});

const transcribeBody = z.object({
  audio: z.string().min(1),
});

router.post("/voice/synthesize", requireAuth, synthesizeLimit, validate({ body: synthesizeBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, voiceId, roleTitle, department, personality, stability, similarityBoost, speed } = req.body;

    const profile = resolveVoiceProfile(roleTitle, department);
    const resolvedVoiceId = voiceId || profile.voiceId;

    const personalitySettings = personalityToVoiceSettings(personality as PersonalityAxes | undefined);

    const finalStability = stability ?? personalitySettings.stability;
    const finalSimilarityBoost = similarityBoost ?? personalitySettings.similarity_boost;
    const finalSpeed = speed ?? personalitySettings.speed;
    const finalStyle = personalitySettings.style;

    const audioBuffer = await textToSpeech(text, {
      voiceId: resolvedVoiceId,
      stability: finalStability,
      similarityBoost: finalSimilarityBoost,
      speed: finalSpeed,
      style: finalStyle,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audioBuffer.length));
    res.setHeader("X-Voice-Id", resolvedVoiceId);
    res.setHeader("X-Voice-Profile", profile.label);
    res.send(audioBuffer);
  } catch (error) {
    if (error instanceof Error && error.message.includes("ElevenLabs")) {
      next(AppError.badRequest(error.message));
    } else {
      next(error);
    }
  }
});

router.post("/voice/transcribe", requireAuth, transcribeLimit, validate({ body: transcribeBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audio } = req.body;

    const base64Data = audio.replace(/^data:audio\/[^;]+;base64,/, "");
    const audioBuffer = Buffer.from(base64Data, "base64");

    if (audioBuffer.length === 0) {
      throw AppError.badRequest("No audio data provided");
    }

    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw AppError.badRequest("Audio file too large (max 25MB)");
    }

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://ai-proxy.replit.app/v1",
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
    });

    const audioFile = new File([new Uint8Array(audioBuffer)], "audio.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "en",
    });

    res.json({
      text: transcription.text,
      language: "en",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/voice/profiles", requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = [
      { category: "warm", label: "Warm & Empathetic", description: "Best for counseling, HR, and support roles", voiceId: "EXAVITQu4vr4xnSDxMaL" },
      { category: "authoritative", label: "Authoritative & Commanding", description: "Best for executive, leadership, and legal roles", voiceId: "VR6AewLTigWG4xSOukaG" },
      { category: "technical", label: "Technical & Precise", description: "Best for engineering, data, and analytics roles", voiceId: "pNInz6obpgDQGcFmaJgB" },
      { category: "creative", label: "Creative & Expressive", description: "Best for design, marketing, and creative roles", voiceId: "jsCqWAovK2LkecY7zXl4" },
      { category: "neutral", label: "Neutral & Professional", description: "General-purpose professional voice", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    ];

    res.json({ data: profiles });
  } catch (error) {
    next(error);
  }
});

export default router;
