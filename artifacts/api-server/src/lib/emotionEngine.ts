export type EmotionState =
  | "neutral"
  | "enthusiastic"
  | "empathetic"
  | "focused"
  | "reassuring"
  | "apologetic"
  | "thoughtful";

export interface EmotionAnalysis {
  primary: EmotionState;
  intensity: number;
  voiceParams: {
    stability: number;
    style: number;
    speed: number;
  };
}

const EMOTION_PATTERNS: Record<EmotionState, { keywords: string[]; phrases: string[] }> = {
  enthusiastic: {
    keywords: [
      "excited", "amazing", "fantastic", "excellent", "great", "wonderful",
      "thrilled", "incredible", "awesome", "brilliant", "perfect", "outstanding",
      "love", "congratulations", "celebrate", "achievement", "success",
    ],
    phrases: [
      "great news", "well done", "i'm excited", "that's fantastic",
      "looking forward", "can't wait", "absolutely", "what a great",
    ],
  },
  empathetic: {
    keywords: [
      "understand", "sorry to hear", "difficult", "challenging", "tough",
      "frustrating", "concerned", "worried", "stress", "struggle", "feel",
      "sympathize", "compassion", "care", "support",
    ],
    phrases: [
      "i understand", "that must be", "i can see", "it's understandable",
      "i hear you", "that sounds difficult", "i'm here to help",
      "let me help", "i appreciate you sharing",
    ],
  },
  focused: {
    keywords: [
      "analyze", "data", "review", "examine", "investigate", "research",
      "calculate", "evaluate", "assess", "metrics", "numbers", "statistics",
      "findings", "report", "breakdown", "details", "specifically",
    ],
    phrases: [
      "let me analyze", "looking at the data", "based on my analysis",
      "the numbers show", "according to", "upon review", "digging into",
      "examining the", "the key finding",
    ],
  },
  reassuring: {
    keywords: [
      "confident", "assured", "certain", "secure", "safe", "reliable",
      "trust", "guarantee", "absolutely", "definitely", "handled",
      "taken care", "completed", "confirmed", "resolved", "fixed",
    ],
    phrases: [
      "don't worry", "rest assured", "i've got this", "everything is",
      "it's all set", "you can count on", "i've confirmed", "all taken care",
      "successfully completed", "no issues",
    ],
  },
  apologetic: {
    keywords: [
      "apologize", "sorry", "mistake", "error", "oversight", "unfortunately",
      "regret", "inconvenience", "fault", "wrong", "issue", "problem",
    ],
    phrases: [
      "i apologize", "i'm sorry", "my mistake", "i should have",
      "unfortunately", "i regret", "please forgive", "that was an error",
    ],
  },
  thoughtful: {
    keywords: [
      "consider", "perhaps", "maybe", "interesting", "hmm", "thinking",
      "processing", "complex", "nuanced", "perspective", "option",
      "alternative", "weigh", "ponder", "reflect",
    ],
    phrases: [
      "let me think", "that's an interesting", "considering the options",
      "on one hand", "another perspective", "worth considering",
      "let me consider", "thinking about this",
    ],
  },
  neutral: {
    keywords: [],
    phrases: [],
  },
};

const VOICE_PARAMS: Record<EmotionState, EmotionAnalysis["voiceParams"]> = {
  neutral: { stability: 0.75, style: 0.3, speed: 1.0 },
  enthusiastic: { stability: 0.55, style: 0.7, speed: 1.1 },
  empathetic: { stability: 0.80, style: 0.6, speed: 0.9 },
  focused: { stability: 0.85, style: 0.2, speed: 1.0 },
  reassuring: { stability: 0.70, style: 0.4, speed: 0.95 },
  apologetic: { stability: 0.80, style: 0.5, speed: 0.85 },
  thoughtful: { stability: 0.75, style: 0.3, speed: 0.9 },
};

export function analyzeEmotion(text: string): EmotionAnalysis {
  const lower = text.toLowerCase();
  const scores: Record<EmotionState, number> = {
    neutral: 0.1,
    enthusiastic: 0,
    empathetic: 0,
    focused: 0,
    reassuring: 0,
    apologetic: 0,
    thoughtful: 0,
  };

  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS) as [EmotionState, typeof EMOTION_PATTERNS[EmotionState]][]) {
    if (emotion === "neutral") continue;

    for (const keyword of patterns.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) {
        scores[emotion] += matches.length * 1.0;
      }
    }

    for (const phrase of patterns.phrases) {
      if (lower.includes(phrase)) {
        scores[emotion] += 2.5;
      }
    }
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  scores.enthusiastic += exclamationCount * 0.5;

  const questionCount = (text.match(/\?/g) || []).length;
  scores.thoughtful += questionCount * 0.3;

  let primaryEmotion: EmotionState = "neutral";
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(scores) as [EmotionState, number][]) {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion;
    }
  }

  const intensity = Math.min(1.0, maxScore / 8);

  return {
    primary: primaryEmotion,
    intensity,
    voiceParams: VOICE_PARAMS[primaryEmotion],
  };
}

export function detectMessageType(
  text: string,
  context?: { hasData?: boolean; hasTasks?: boolean; isEscalation?: boolean }
): string {
  if (context?.isEscalation) return "escalation_notice";

  const lower = text.toLowerCase();

  if (lower.includes("shall i") || lower.includes("should i") ||
      lower.includes("would you like me to") || lower.includes("do you want me to") ||
      lower.includes("approve") || lower.includes("confirm")) {
    const actionMatch = text.match(/(shall i|should i|would you like me to|do you want me to)\s+(.+?)(\?|$)/i);
    if (actionMatch) return "action_confirmation";
  }

  if (context?.hasData ||
      text.includes("|") && text.includes("---") ||
      /\d+%|\$[\d,]+|\d+\.\d+/.test(text)) {
    const dataIndicators = (text.match(/\d+%/g) || []).length +
                          (text.match(/\$[\d,]+/g) || []).length;
    if (dataIndicators >= 2) return "data_card";
  }

  if (lower.includes("report") && (lower.includes("attached") || lower.includes("generated") || lower.includes("download"))) {
    return "file_attachment";
  }

  if (lower.includes("in progress") || lower.includes("completed") ||
      lower.includes("step") && /\d+\s*(of|\/)\s*\d+/.test(text)) {
    return "status_update";
  }

  return "text";
}

export function extractQuickReplies(text: string): string[] {
  const replies: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes("would you like") || lower.includes("shall i") ||
      lower.includes("do you want") || lower.includes("should i")) {
    replies.push("Yes, please");
    replies.push("No, thanks");
    replies.push("Tell me more");
  }

  if (lower.includes("any questions") || lower.includes("anything else")) {
    replies.push("No, that's all");
    replies.push("Yes, I have a question");
  }

  if (lower.includes("option") || lower.includes("choose") || lower.includes("prefer")) {
    replies.push("Option A");
    replies.push("Option B");
    replies.push("Show me both");
  }

  return replies.slice(0, 4);
}
