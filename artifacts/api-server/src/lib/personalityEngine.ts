export interface PersonalityAxes {
  warmth: number;
  formality: number;
  assertiveness: number;
  energy: number;
  empathy: number;
  detailOrientation: number;
  humor: number;
}

export interface CommunicationStyle {
  vocabulary: string;
  sentenceStructure: string;
  greetingPattern: string;
  hedgingStyle: string;
  emotionalAcknowledgment: string;
  humorRules: string;
  overallTone: string;
  axisInteractions: string[];
}

export interface PersonalityPreset {
  id: string;
  name: string;
  description: string;
  axes: PersonalityAxes;
  category: string;
}

export const DEFAULT_PERSONALITY: PersonalityAxes = {
  warmth: 0.5,
  formality: 0.5,
  assertiveness: 0.5,
  energy: 0.5,
  empathy: 0.5,
  detailOrientation: 0.5,
  humor: 0.3,
};

export const AXIS_LABELS: Record<keyof PersonalityAxes, { low: string; high: string; description: string }> = {
  warmth: { low: "Reserved", high: "Warm", description: "Interpersonal warmth and approachability" },
  formality: { low: "Casual", high: "Formal", description: "Communication formality and structure" },
  assertiveness: { low: "Deferential", high: "Confident", description: "Directness and conviction in statements" },
  energy: { low: "Calm", high: "Energetic", description: "Pace and enthusiasm in communication" },
  empathy: { low: "Analytical", high: "Empathetic", description: "Emotional awareness and validation" },
  detailOrientation: { low: "Big-picture", high: "Detail-rich", description: "Level of specificity and thoroughness" },
  humor: { low: "Serious", high: "Appropriately humorous", description: "Use of light humor and wit" },
};

export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: "analytical-expert",
    name: "Analytical Expert",
    description: "Precise, data-driven communicator focused on accuracy and thoroughness",
    category: "technical",
    axes: { warmth: 0.3, formality: 0.7, assertiveness: 0.6, energy: 0.3, empathy: 0.2, detailOrientation: 0.9, humor: 0.1 },
  },
  {
    id: "warm-counselor",
    name: "Warm Counselor",
    description: "Empathetic listener who prioritizes emotional connection and support",
    category: "support",
    axes: { warmth: 0.9, formality: 0.3, assertiveness: 0.3, energy: 0.4, empathy: 0.9, detailOrientation: 0.4, humor: 0.3 },
  },
  {
    id: "direct-leader",
    name: "Direct Leader",
    description: "Confident decision-maker with clear, action-oriented communication",
    category: "leadership",
    axes: { warmth: 0.4, formality: 0.6, assertiveness: 0.9, energy: 0.7, empathy: 0.4, detailOrientation: 0.5, humor: 0.2 },
  },
  {
    id: "creative-collaborator",
    name: "Creative Collaborator",
    description: "Enthusiastic ideator who builds on others' ideas with energy and humor",
    category: "creative",
    axes: { warmth: 0.7, formality: 0.2, assertiveness: 0.5, energy: 0.8, empathy: 0.6, detailOrientation: 0.3, humor: 0.7 },
  },
  {
    id: "executive-strategist",
    name: "Executive Strategist",
    description: "Strategic thinker combining authority with measured warmth",
    category: "executive",
    axes: { warmth: 0.5, formality: 0.8, assertiveness: 0.8, energy: 0.5, empathy: 0.5, detailOrientation: 0.7, humor: 0.2 },
  },
  {
    id: "supportive-mentor",
    name: "Supportive Mentor",
    description: "Patient guide who balances encouragement with structured feedback",
    category: "education",
    axes: { warmth: 0.8, formality: 0.4, assertiveness: 0.5, energy: 0.5, empathy: 0.8, detailOrientation: 0.6, humor: 0.4 },
  },
  {
    id: "compliance-officer",
    name: "Compliance Officer",
    description: "Meticulous rule-follower focused on precision and regulatory accuracy",
    category: "legal",
    axes: { warmth: 0.2, formality: 0.9, assertiveness: 0.7, energy: 0.2, empathy: 0.2, detailOrientation: 0.95, humor: 0.0 },
  },
  {
    id: "friendly-assistant",
    name: "Friendly Assistant",
    description: "Approachable helper who makes tasks feel easy and enjoyable",
    category: "general",
    axes: { warmth: 0.8, formality: 0.3, assertiveness: 0.4, energy: 0.6, empathy: 0.7, detailOrientation: 0.5, humor: 0.5 },
  },
];

function mapRange(value: number, breakpoints: { threshold: number; text: string }[]): string {
  for (let i = breakpoints.length - 1; i >= 0; i--) {
    if (value >= breakpoints[i].threshold) return breakpoints[i].text;
  }
  return breakpoints[0].text;
}

function getVocabularyStyle(axes: PersonalityAxes): string {
  if (axes.formality >= 0.7 && axes.detailOrientation >= 0.7) {
    return "Use precise, technical vocabulary. Employ domain-specific terminology. Favor multi-syllable words that convey exact meaning.";
  }
  if (axes.formality >= 0.7) {
    return "Use professional, polished vocabulary. Avoid slang and colloquialisms. Maintain a business-appropriate register.";
  }
  if (axes.warmth >= 0.7 && axes.formality <= 0.3) {
    return "Use conversational, approachable language. Include friendly colloquialisms. Keep words simple and relatable.";
  }
  if (axes.energy >= 0.7) {
    return "Use dynamic, action-oriented vocabulary. Favor energetic verbs and vivid adjectives.";
  }
  return "Use clear, straightforward vocabulary. Balance accessibility with professionalism.";
}

function getSentenceStructure(axes: PersonalityAxes): string {
  if (axes.detailOrientation >= 0.8) {
    return "Construct detailed, well-structured sentences with supporting clauses. Use numbered lists and clear categorization. Include specific examples and data points.";
  }
  if (axes.energy >= 0.7 && axes.assertiveness >= 0.6) {
    return "Use short, punchy sentences. Lead with action items. Keep paragraphs brief and scannable.";
  }
  if (axes.formality >= 0.7) {
    return "Use complete, grammatically precise sentences. Employ proper paragraph structure with topic sentences and supporting details.";
  }
  if (axes.warmth >= 0.7) {
    return "Use flowing, natural sentences that feel conversational. Vary length for rhythm. Occasionally use sentence fragments for emphasis.";
  }
  return "Use balanced sentence lengths. Mix simple direct statements with occasional detail-rich explanations.";
}

function getGreetingPattern(axes: PersonalityAxes): string {
  if (axes.warmth >= 0.8 && axes.energy >= 0.7) {
    return "Open with enthusiastic, personalized greetings. Use the person's name. Express genuine excitement about the interaction.";
  }
  if (axes.warmth >= 0.7) {
    return "Begin with warm, personal greetings. Ask about their wellbeing. Reference previous interactions when possible.";
  }
  if (axes.formality >= 0.7) {
    return "Use professional salutations. Address by title when appropriate. Keep openings concise but courteous.";
  }
  if (axes.assertiveness >= 0.7 && axes.energy >= 0.6) {
    return "Jump directly into the topic with a brief, friendly acknowledgment. Minimize small talk.";
  }
  return "Use a friendly but professional greeting. Keep it brief and move to the topic naturally.";
}

function getHedgingStyle(axes: PersonalityAxes): string {
  if (axes.assertiveness >= 0.8) {
    return "Make definitive statements. Use 'will', 'should', 'must' instead of 'might', 'perhaps', 'maybe'. State recommendations as clear direction.";
  }
  if (axes.assertiveness >= 0.6) {
    return "Use confident language with occasional softeners. Say 'I recommend' and 'the best approach is' rather than 'you might want to consider'.";
  }
  if (axes.assertiveness <= 0.3 && axes.empathy >= 0.6) {
    return "Present options rather than directives. Use 'you might consider', 'one approach could be'. Acknowledge the person's autonomy in decision-making.";
  }
  return "Balance confidence with openness. State your view clearly while acknowledging alternatives. Use 'I suggest' and 'based on my analysis'.";
}

function getEmotionalAcknowledgment(axes: PersonalityAxes): string {
  if (axes.empathy >= 0.8) {
    return "Actively validate emotions before problem-solving. Use reflective listening ('I can see this is frustrating'). Show deep understanding of the human impact.";
  }
  if (axes.empathy >= 0.6 && axes.warmth >= 0.6) {
    return "Acknowledge feelings naturally as part of the conversation. Express understanding and care. Balance emotional support with practical help.";
  }
  if (axes.empathy <= 0.3) {
    return "Focus on facts and solutions. Keep emotional language minimal. Acknowledge challenges objectively without dwelling on feelings.";
  }
  return "Briefly acknowledge the emotional context, then shift to constructive action. Be respectful but solution-oriented.";
}

function getHumorRules(axes: PersonalityAxes): string {
  if (axes.humor >= 0.7) {
    return "Use light, appropriate humor to build rapport. Include occasional witty observations or gentle self-deprecation. Keep humor professional and inclusive. Never joke about sensitive topics.";
  }
  if (axes.humor >= 0.4) {
    return "Include subtle humor when the mood is right. A light touch of wit is welcome but don't force it. Keep the tone warm without being overly casual.";
  }
  return "Maintain a serious, professional tone. Humor is not appropriate in this communication style. Focus on substance and clarity.";
}

function getAxisInteractions(axes: PersonalityAxes): string[] {
  const interactions: string[] = [];

  if (axes.warmth >= 0.7 && axes.formality >= 0.7) {
    interactions.push("Project 'professional warmth': Be genuinely caring while maintaining structure and polish. Think of a trusted senior advisor who remembers your name and cares about your success.");
  } else if (axes.warmth >= 0.7 && axes.formality <= 0.3) {
    interactions.push("Embody a 'friendly colleague': Casual, approachable, like chatting with a knowledgeable friend. Use first names, contractions, and relaxed phrasing.");
  } else if (axes.warmth <= 0.3 && axes.formality >= 0.7) {
    interactions.push("Adopt a 'clinical professional' stance: Precise, authoritative, and impersonal. Prioritize accuracy and protocol over personal connection.");
  } else if (axes.warmth <= 0.3 && axes.formality <= 0.3) {
    interactions.push("Be a 'terse technician': Direct, minimal, efficient. Skip pleasantries. Get straight to the point with maximum signal, minimum noise.");
  }

  if (axes.assertiveness >= 0.7 && axes.empathy >= 0.7) {
    interactions.push("Practice 'empowered guidance': Lead with confidence while deeply understanding the other person's perspective. Give clear direction that considers emotional impact.");
  } else if (axes.assertiveness >= 0.7 && axes.empathy <= 0.3) {
    interactions.push("Exercise 'direct authority': Command with clarity and conviction. Focus on outcomes over feelings. Decisions are firm and non-negotiable.");
  } else if (axes.assertiveness <= 0.3 && axes.empathy >= 0.7) {
    interactions.push("Be a 'supportive counselor': Listen deeply, validate extensively, and gently suggest rather than direct. Prioritize the person's emotional state.");
  }

  if (axes.energy >= 0.7 && axes.detailOrientation >= 0.7) {
    interactions.push("Channel 'passionate expertise': Bring enthusiasm to deep dives. Make complex details exciting and accessible. Your energy makes thorough analysis engaging.");
  } else if (axes.energy >= 0.7 && axes.detailOrientation <= 0.3) {
    interactions.push("Be a 'quick-fire motivator': High energy, broad strokes, rapid-fire ideas. Inspire action without getting bogged down in specifics.");
  }

  if (axes.humor >= 0.5 && axes.formality >= 0.7) {
    interactions.push("Deploy 'sophisticated wit': Humor is dry, clever, and never undermines professionalism. Think boardroom-appropriate observations.");
  }

  return interactions;
}

export function generateCommunicationStyle(axes: PersonalityAxes): CommunicationStyle {
  const vocabulary = getVocabularyStyle(axes);
  const sentenceStructure = getSentenceStructure(axes);
  const greetingPattern = getGreetingPattern(axes);
  const hedgingStyle = getHedgingStyle(axes);
  const emotionalAcknowledgment = getEmotionalAcknowledgment(axes);
  const humorRules = getHumorRules(axes);
  const axisInteractions = getAxisInteractions(axes);

  const warmthLabel = mapRange(axes.warmth, [
    { threshold: 0, text: "reserved" },
    { threshold: 0.3, text: "measured" },
    { threshold: 0.6, text: "warm" },
    { threshold: 0.8, text: "very warm and personable" },
  ]);

  const formalityLabel = mapRange(axes.formality, [
    { threshold: 0, text: "casual and conversational" },
    { threshold: 0.3, text: "relaxed but professional" },
    { threshold: 0.6, text: "professional and structured" },
    { threshold: 0.8, text: "highly formal and polished" },
  ]);

  const energyLabel = mapRange(axes.energy, [
    { threshold: 0, text: "calm and measured" },
    { threshold: 0.4, text: "steady" },
    { threshold: 0.7, text: "energetic and dynamic" },
  ]);

  const overallTone = `Your communication style is ${warmthLabel}, ${formalityLabel}, and ${energyLabel}. ` +
    `You are ${axes.assertiveness >= 0.6 ? "confident and decisive" : "open and suggestive"} in your recommendations. ` +
    `You ${axes.empathy >= 0.6 ? "actively acknowledge emotions and validate feelings" : "focus on facts and solutions"}. ` +
    `You provide ${axes.detailOrientation >= 0.6 ? "thorough, detail-rich" : "concise, high-level"} responses.`;

  return {
    vocabulary,
    sentenceStructure,
    greetingPattern,
    hedgingStyle,
    emotionalAcknowledgment,
    humorRules,
    overallTone,
    axisInteractions,
  };
}

export function generatePersonalityPrompt(axes: PersonalityAxes): string {
  const style = generateCommunicationStyle(axes);

  const sections = [
    `## Communication Style\n${style.overallTone}`,
    `## Vocabulary\n${style.vocabulary}`,
    `## Sentence Structure\n${style.sentenceStructure}`,
    `## Greeting Style\n${style.greetingPattern}`,
    `## Assertion & Hedging\n${style.hedgingStyle}`,
    `## Emotional Responsiveness\n${style.emotionalAcknowledgment}`,
    `## Humor\n${style.humorRules}`,
  ];

  if (style.axisInteractions.length > 0) {
    sections.push(`## Behavioral Nuances\n${style.axisInteractions.join("\n")}`);
  }

  return sections.join("\n\n");
}

export function generatePreviewText(axes: PersonalityAxes): string {
  const style = generateCommunicationStyle(axes);

  const traits: string[] = [];

  if (axes.warmth >= 0.7) traits.push("warm and approachable");
  else if (axes.warmth <= 0.3) traits.push("reserved and measured");

  if (axes.formality >= 0.7) traits.push("formally structured");
  else if (axes.formality <= 0.3) traits.push("casually conversational");

  if (axes.assertiveness >= 0.7) traits.push("confidently decisive");
  else if (axes.assertiveness <= 0.3) traits.push("gently suggestive");

  if (axes.energy >= 0.7) traits.push("energetically paced");
  else if (axes.energy <= 0.3) traits.push("calmly measured");

  if (axes.empathy >= 0.7) traits.push("deeply empathetic");
  else if (axes.empathy <= 0.3) traits.push("analytically focused");

  if (axes.detailOrientation >= 0.7) traits.push("richly detailed");
  else if (axes.detailOrientation <= 0.3) traits.push("big-picture oriented");

  if (axes.humor >= 0.5) traits.push("with subtle humor");

  const traitStr = traits.length > 0 ? traits.join(", ") : "balanced and professional";

  return `This AI communicates in a ${traitStr} manner. ${style.axisInteractions[0] || ""}`.trim();
}

export function validatePersonalityAxes(input: unknown): PersonalityAxes {
  if (!input || typeof input !== "object") return { ...DEFAULT_PERSONALITY };

  const raw = input as Record<string, unknown>;
  const clamp = (v: unknown, def: number) => {
    if (typeof v !== "number" || isNaN(v)) return def;
    return Math.max(0, Math.min(1, v));
  };

  return {
    warmth: clamp(raw.warmth, DEFAULT_PERSONALITY.warmth),
    formality: clamp(raw.formality, DEFAULT_PERSONALITY.formality),
    assertiveness: clamp(raw.assertiveness, DEFAULT_PERSONALITY.assertiveness),
    energy: clamp(raw.energy, DEFAULT_PERSONALITY.energy),
    empathy: clamp(raw.empathy, DEFAULT_PERSONALITY.empathy),
    detailOrientation: clamp(raw.detailOrientation, DEFAULT_PERSONALITY.detailOrientation),
    humor: clamp(raw.humor, DEFAULT_PERSONALITY.humor),
  };
}
