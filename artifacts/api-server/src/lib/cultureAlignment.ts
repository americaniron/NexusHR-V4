export interface CultureProfile {
  formalityBaseline: number;
  industryTerminology: string[];
  valuesEmphasis: string[];
  communicationNorms: string[];
  tonePreference?: "professional" | "casual" | "inspirational" | "technical";
  industryContext?: string;
}

export const DEFAULT_CULTURE_PROFILE: CultureProfile = {
  formalityBaseline: 0.5,
  industryTerminology: [],
  valuesEmphasis: [],
  communicationNorms: [],
  tonePreference: "professional",
};

export function generateCulturePrompt(culture: CultureProfile | null | undefined): string {
  if (!culture) return "";

  const sections: string[] = [];

  if (culture.formalityBaseline !== undefined) {
    const level = culture.formalityBaseline >= 0.7
      ? "This organization values formal, polished communication. Maintain professional language at all times."
      : culture.formalityBaseline <= 0.3
      ? "This organization has a casual culture. Relaxed, conversational communication is preferred."
      : "This organization balances professionalism with approachability.";
    sections.push(level);
  }

  if (culture.tonePreference) {
    const toneMap: Record<string, string> = {
      professional: "Maintain a professional, business-appropriate tone throughout all interactions.",
      casual: "Use a relaxed, friendly tone. First names, contractions, and conversational style are encouraged.",
      inspirational: "Infuse communications with purpose and vision. Connect work to the bigger mission.",
      technical: "Prioritize technical precision. Use exact terminology and data-driven language.",
    };
    sections.push(toneMap[culture.tonePreference] || "");
  }

  if (culture.industryTerminology.length > 0) {
    sections.push(
      `Use the following industry-specific terminology naturally in your communication: ${culture.industryTerminology.join(", ")}.`
    );
  }

  if (culture.valuesEmphasis.length > 0) {
    sections.push(
      `This organization prioritizes the following values — reflect them in your communication: ${culture.valuesEmphasis.join(", ")}.`
    );
  }

  if (culture.communicationNorms.length > 0) {
    sections.push(
      `Follow these organizational communication norms:\n${culture.communicationNorms.map(n => `- ${n}`).join("\n")}`
    );
  }

  if (culture.industryContext) {
    sections.push(`Industry context: ${culture.industryContext}. Adapt your vocabulary and references accordingly.`);
  }

  if (sections.length === 0) return "";

  return `## Organizational Culture Alignment\n${sections.join("\n")}`;
}

export function validateCultureProfile(input: unknown): CultureProfile {
  if (!input || typeof input !== "object") return { ...DEFAULT_CULTURE_PROFILE };

  const raw = input as Record<string, unknown>;

  return {
    formalityBaseline: typeof raw.formalityBaseline === "number"
      ? Math.max(0, Math.min(1, raw.formalityBaseline))
      : DEFAULT_CULTURE_PROFILE.formalityBaseline,
    industryTerminology: Array.isArray(raw.industryTerminology)
      ? raw.industryTerminology.filter((t): t is string => typeof t === "string").slice(0, 50)
      : [],
    valuesEmphasis: Array.isArray(raw.valuesEmphasis)
      ? raw.valuesEmphasis.filter((v): v is string => typeof v === "string").slice(0, 20)
      : [],
    communicationNorms: Array.isArray(raw.communicationNorms)
      ? raw.communicationNorms.filter((n): n is string => typeof n === "string").slice(0, 20)
      : [],
    tonePreference: ["professional", "casual", "inspirational", "technical"].includes(raw.tonePreference as string)
      ? raw.tonePreference as CultureProfile["tonePreference"]
      : "professional",
    industryContext: typeof raw.industryContext === "string" ? raw.industryContext.slice(0, 500) : undefined,
  };
}
