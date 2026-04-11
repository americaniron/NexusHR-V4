export interface PersonalityAxes {
  energy?: number;
  formality?: number;
  warmth?: number;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

export interface RoleVoiceProfile {
  voiceId: string;
  label: string;
  category: "warm" | "authoritative" | "technical" | "creative" | "neutral";
}

const ROLE_VOICE_PROFILES: Record<string, RoleVoiceProfile> = {
  counseling: { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Bella (Warm)", category: "warm" },
  hr: { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Bella (Warm)", category: "warm" },
  support: { voiceId: "EXAVITQu4vr4xnSDxMaL", label: "Bella (Warm)", category: "warm" },
  executive: { voiceId: "VR6AewLTigWG4xSOukaG", label: "Arnold (Authoritative)", category: "authoritative" },
  leadership: { voiceId: "VR6AewLTigWG4xSOukaG", label: "Arnold (Authoritative)", category: "authoritative" },
  legal: { voiceId: "VR6AewLTigWG4xSOukaG", label: "Arnold (Authoritative)", category: "authoritative" },
  engineering: { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Adam (Technical)", category: "technical" },
  data: { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Adam (Technical)", category: "technical" },
  analytics: { voiceId: "pNInz6obpgDQGcFmaJgB", label: "Adam (Technical)", category: "technical" },
  design: { voiceId: "jsCqWAovK2LkecY7zXl4", label: "Freya (Creative)", category: "creative" },
  marketing: { voiceId: "jsCqWAovK2LkecY7zXl4", label: "Freya (Creative)", category: "creative" },
  creative: { voiceId: "jsCqWAovK2LkecY7zXl4", label: "Freya (Creative)", category: "creative" },
  default: { voiceId: "21m00Tcm4TlvDq8ikWAM", label: "Rachel (Neutral)", category: "neutral" },
};

export function resolveVoiceProfile(roleTitle?: string, department?: string): RoleVoiceProfile {
  if (!roleTitle && !department) return ROLE_VOICE_PROFILES.default;

  const searchTerms = `${roleTitle || ""} ${department || ""}`.toLowerCase();

  for (const [keyword, profile] of Object.entries(ROLE_VOICE_PROFILES)) {
    if (keyword !== "default" && searchTerms.includes(keyword)) {
      return profile;
    }
  }

  return ROLE_VOICE_PROFILES.default;
}

export function personalityToVoiceSettings(personality?: PersonalityAxes): VoiceSettings {
  const energy = personality?.energy ?? 0.5;
  const formality = personality?.formality ?? 0.5;
  const warmth = personality?.warmth ?? 0.5;

  const speed = 0.7 + (energy * 0.6);
  const stability = 0.3 + (formality * 0.5);
  const style = 0.2 + (warmth * 0.6);
  const similarity_boost = 0.6 + (warmth * 0.25);

  return {
    stability: clamp(stability, 0, 1),
    similarity_boost: clamp(similarity_boost, 0, 1),
    style: clamp(style, 0, 1),
    speed: clamp(speed, 0.5, 2.0),
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function mergeVoiceSettings(
  base: Partial<VoiceSettings>,
  personalityOverrides: Partial<VoiceSettings>
): VoiceSettings {
  return {
    stability: personalityOverrides.stability ?? base.stability ?? 0.5,
    similarity_boost: personalityOverrides.similarity_boost ?? base.similarity_boost ?? 0.75,
    style: personalityOverrides.style ?? base.style ?? 0.3,
    speed: personalityOverrides.speed ?? base.speed ?? 1.0,
  };
}
