import type { PersonalityAxes } from "./personalityEngine";

export interface ToneAdjustment {
  promptInstructions: string;
  voiceParams: {
    speedMultiplier: number;
    stabilityOffset: number;
    styleOffset: number;
  };
}

export interface ConversationContext {
  recentMessages: Array<{ role: string; content: string }>;
  taskUrgency?: "low" | "medium" | "high" | "critical";
  interactionCount?: number;
  userSentiment?: "positive" | "neutral" | "negative" | "frustrated";
}

export function analyzeSentiment(messages: Array<{ role: string; content: string }>): "positive" | "neutral" | "negative" | "frustrated" {
  const userMessages = messages
    .filter(m => m.role === "user")
    .slice(-5)
    .map(m => m.content.toLowerCase());

  if (userMessages.length === 0) return "neutral";

  const lastMsg = userMessages[userMessages.length - 1];

  const frustratedPatterns = [
    /this (is|isn't) working/,
    /why (won't|doesn't|can't|isn't)/,
    /still (not|broken|wrong)/,
    /ugh|argh|seriously|ridiculous/,
    /\?{2,}|!{2,}/,
    /how many times/,
    /already (told|asked|said)/,
    /waste of time/,
  ];

  const negativePatterns = [
    /not (happy|satisfied|pleased)/,
    /problem|issue|error|wrong|bad|terrible/,
    /confused|don't understand/,
    /disappointed|concern/,
  ];

  const positivePatterns = [
    /thank|thanks|great|awesome|perfect|excellent/,
    /love (it|this|that)/,
    /well done|good job|amazing/,
    /exactly what I (need|want)/,
    /helpful|appreciate/,
  ];

  for (const p of frustratedPatterns) {
    if (p.test(lastMsg)) return "frustrated";
  }

  let posCount = 0;
  let negCount = 0;

  for (const msg of userMessages) {
    for (const p of positivePatterns) { if (p.test(msg)) posCount++; }
    for (const p of negativePatterns) { if (p.test(msg)) negCount++; }
  }

  if (negCount > posCount + 1) return "negative";
  if (posCount > negCount + 1) return "positive";
  return "neutral";
}

export function computeToneAdjustment(
  basePersonality: PersonalityAxes,
  context: ConversationContext,
): ToneAdjustment {
  const sentiment = context.userSentiment || analyzeSentiment(context.recentMessages);
  const urgency = context.taskUrgency || "medium";
  const interactionCount = context.interactionCount || 0;

  const instructions: string[] = [];
  let speedMult = 1.0;
  let stabilityOff = 0;
  let styleOff = 0;

  if (sentiment === "frustrated") {
    instructions.push(
      "The user appears frustrated. Acknowledge their frustration directly and empathetically before addressing the issue.",
      "Slow down your pace. Be patient and methodical in your explanation.",
      "Avoid repeating previous suggestions without acknowledging they didn't work.",
      "Offer concrete next steps rather than general advice.",
    );
    speedMult = 0.9;
    stabilityOff = 0.1;
    styleOff = 0.1;
  } else if (sentiment === "negative") {
    instructions.push(
      "The user seems concerned or unhappy. Acknowledge their feelings briefly before proceeding.",
      "Be extra clear and reassuring in your responses.",
    );
    stabilityOff = 0.05;
    styleOff = 0.05;
  } else if (sentiment === "positive") {
    instructions.push(
      "The user is in a positive mood. Match their energy appropriately.",
    );
    styleOff = -0.05;
  }

  if (urgency === "critical") {
    instructions.push(
      "This is a CRITICAL priority task. Respond with maximum urgency and directness.",
      "Skip pleasantries. Lead with the most important action items.",
      "Be concise — every second matters.",
    );
    speedMult *= 1.1;
    stabilityOff += 0.1;
  } else if (urgency === "high") {
    instructions.push(
      "This is high priority. Be efficient and action-oriented in your response.",
      "Prioritize the most impactful information first.",
    );
    speedMult *= 1.05;
  }

  if (interactionCount > 20 && basePersonality.warmth >= 0.5) {
    instructions.push(
      "You have an established relationship with this user. You can be slightly more familiar in tone.",
    );
  }

  if (interactionCount === 0) {
    instructions.push(
      "This is your first interaction with this user. Introduce yourself naturally and set a professional tone.",
    );
  }

  return {
    promptInstructions: instructions.length > 0
      ? `## Real-time Tone Adjustments\n${instructions.join("\n")}`
      : "",
    voiceParams: {
      speedMultiplier: speedMult,
      stabilityOffset: stabilityOff,
      styleOffset: styleOff,
    },
  };
}
