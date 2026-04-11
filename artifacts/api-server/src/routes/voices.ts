import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { listVoices } from "../lib/elevenlabs";
import { logger } from "../lib/logger";

const router = Router();

const PRESET_VOICES = [
  { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "professional", gender: "female", accent: "American", preview_url: null },
  { voice_id: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "professional", gender: "male", accent: "American", preview_url: null },
  { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "creative", gender: "female", accent: "American", preview_url: null },
  { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", category: "professional", gender: "female", accent: "American", preview_url: null },
  { voice_id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "professional", gender: "male", accent: "American", preview_url: null },
  { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "authoritative", gender: "male", accent: "American", preview_url: null },
  { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "professional", gender: "male", accent: "American", preview_url: null },
  { voice_id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", category: "professional", gender: "male", accent: "American", preview_url: null },
  { voice_id: "jBpfuIE2acCO8z3wKNLl", name: "Gigi", category: "creative", gender: "female", accent: "American", preview_url: null },
  { voice_id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", category: "authoritative", gender: "male", accent: "British", preview_url: null },
  { voice_id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", category: "professional", gender: "female", accent: "British", preview_url: null },
  { voice_id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", category: "creative", gender: "female", accent: "British", preview_url: null },
];

router.get("/voices", requireAuth, async (_req, res, next) => {
  try {
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voices = await listVoices();
        return res.json({ data: voices, source: "elevenlabs" });
      } catch (err) {
        logger.warn({ err }, "Failed to fetch ElevenLabs voices, falling back to presets");
      }
    }
    res.json({ data: PRESET_VOICES, source: "presets" });
  } catch (error) {
    next(error);
  }
});

export default router;
