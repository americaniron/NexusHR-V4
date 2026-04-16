import express, { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { textToSpeechStream, textToSpeechWithAlignment } from "../lib/elevenlabs";
import { personalityToVoiceSettings, resolveVoiceProfile, type PersonalityAxes } from "../lib/voiceConfig";
import { analyzeEmotion } from "../lib/emotionEngine";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { Readable } from "node:stream";

const router = Router();

const synthesizeLimit = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "voice-synthesize" });
const transcribeLimit = rateLimit({ windowMs: 60_000, max: 15, keyPrefix: "voice-transcribe" });

const transcribeJsonParser = express.json({ limit: "10mb" });

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
    const personalitySettings = personalityToVoiceSettings(personality as PersonalityAxes | undefined);

    const resolvedVoiceId = voiceId || personalitySettings.warmthVoiceId || profile.voiceId;

    const finalStability = stability ?? personalitySettings.stability;
    const finalSimilarityBoost = similarityBoost ?? personalitySettings.similarity_boost;
    const finalSpeed = speed ?? personalitySettings.speed;
    const finalStyle = personalitySettings.style;

    const { body: audioStream, contentType } = await textToSpeechStream(text, {
      voiceId: resolvedVoiceId,
      stability: finalStability,
      similarityBoost: finalSimilarityBoost,
      speed: finalSpeed,
      style: finalStyle,
    });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Voice-Id", resolvedVoiceId);
    res.setHeader("X-Voice-Profile", profile.label);
    res.setHeader("Cache-Control", "no-cache");

    const nodeStream = Readable.fromWeb(audioStream as import("node:stream/web").ReadableStream);

    nodeStream.pipe(res);

    nodeStream.on("error", () => {
      if (!res.headersSent) {
        next(AppError.badRequest("Stream interrupted"));
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ElevenLabs")) {
      next(AppError.badRequest(error.message));
    } else {
      next(error);
    }
  }
});

router.post("/voice/transcribe", requireAuth, transcribeLimit, transcribeJsonParser, validate({ body: transcribeBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audio } = req.body;

    let mimeType = "audio/webm";
    let extension = "webm";
    const dataUrlMatch = audio.match(/^data:(audio\/[^;]+);base64,/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      const mimeToExt: Record<string, string> = {
        "audio/webm": "webm",
        "audio/wav": "wav",
        "audio/wave": "wav",
        "audio/x-wav": "wav",
        "audio/mp3": "mp3",
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/mp4": "m4a",
        "audio/x-m4a": "m4a",
        "audio/flac": "flac",
      };
      extension = mimeToExt[mimeType] || "webm";
    }

    const base64Data = audio.replace(/^data:audio\/[^;]+;base64,/, "");
    const audioBuffer = Buffer.from(base64Data, "base64");

    if (audioBuffer.length === 0) {
      throw AppError.badRequest("No audio data provided");
    }

    const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
    if (audioBuffer.length > MAX_AUDIO_SIZE) {
      throw AppError.badRequest("Audio file too large (max 10MB)");
    }

    const { getAnthropicClient } = await import("@workspace/integrations-anthropic-ai/client");
    const { AI_CONFIG } = await import("../lib/aiConfig");
    const anthropic = getAnthropicClient();

    const base64Audio = audioBuffer.toString("base64");
    const mediaType = mimeType as "audio/webm" | "audio/wav" | "audio/mp3" | "audio/mpeg" | "audio/ogg" | "audio/flac";

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.defaultMaxTokens,
      messages: [{
        role: "user",
        content: [
          {
            type: "input_audio" as any,
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Audio,
            },
          } as any,
          {
            type: "text",
            text: "Please transcribe the audio exactly as spoken. Return ONLY the transcribed text, nothing else. If the audio is unclear, transcribe what you can hear.",
          },
        ],
      }],
    });

    const transcribedText = response.content[0].type === "text" ? response.content[0].text : "";

    res.json({
      text: transcribedText,
      language: "en",
    });
  } catch (error) {
    next(error);
  }
});

const synthesizeAlignedBody = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().max(100).optional(),
  roleTitle: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  personality: z.object({
    energy: z.number().min(0).max(1).optional(),
    formality: z.number().min(0).max(1).optional(),
    warmth: z.number().min(0).max(1).optional(),
  }).optional(),
});

router.post("/voice/synthesize-aligned", requireAuth, synthesizeLimit, validate({ body: synthesizeAlignedBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, voiceId, roleTitle, department, personality } = req.body;

    const profile = resolveVoiceProfile(roleTitle, department);
    const personalitySettings = personalityToVoiceSettings(personality as PersonalityAxes | undefined);
    const emotionAnalysis = analyzeEmotion(text);

    const resolvedVoiceId = voiceId || personalitySettings.warmthVoiceId || profile.voiceId;

    const result = await textToSpeechWithAlignment(text, {
      voiceId: resolvedVoiceId,
      stability: emotionAnalysis.voiceParams.stability,
      similarityBoost: personalitySettings.similarity_boost,
      speed: emotionAnalysis.voiceParams.speed,
      style: emotionAnalysis.voiceParams.style,
    });

    const audioBase64 = result.audio.toString("base64");

    res.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      alignment: result.alignment,
      visemes: result.visemes,
      emotion: emotionAnalysis.primary,
      emotionIntensity: emotionAnalysis.intensity,
      voiceProfile: profile.label,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ElevenLabs")) {
      next(AppError.badRequest(error.message));
    } else {
      next(error);
    }
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
