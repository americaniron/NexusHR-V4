export type TaskIntent = {
  detected: boolean;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  confidence: number;
};

const TASK_TRIGGER_PATTERNS: { pattern: RegExp; category: string; priority: "low" | "medium" | "high" | "urgent" }[] = [
  { pattern: /\b(?:i'll|i will|let me)\s+(?:create|set up|prepare|draft|build|write|generate|compile|put together)\b/i, category: "creation", priority: "medium" },
  { pattern: /\b(?:i'll|i will|let me)\s+(?:schedule|arrange|book|plan|organize)\b/i, category: "scheduling", priority: "medium" },
  { pattern: /\b(?:i'll|i will|let me)\s+(?:review|analyze|audit|assess|evaluate|examine)\b/i, category: "review", priority: "medium" },
  { pattern: /\b(?:i'll|i will|let me)\s+(?:send|email|notify|forward|share|distribute)\b/i, category: "communication", priority: "medium" },
  { pattern: /\b(?:i'll|i will|let me)\s+(?:update|modify|revise|change|adjust|fix)\b/i, category: "update", priority: "medium" },
  { pattern: /\b(?:i'll|i will|let me)\s+(?:research|investigate|look into|explore|find out)\b/i, category: "research", priority: "low" },
  { pattern: /\b(?:action item|todo|to-do|next step|follow[- ]?up)\s*:?\s+/i, category: "follow-up", priority: "medium" },
  { pattern: /\b(?:urgently|immediately|asap|right away|critical)\b/i, category: "urgent", priority: "urgent" },
  { pattern: /\b(?:deadline|due by|due date|must be done by)\b/i, category: "deadline", priority: "high" },
];

const PRIORITY_ESCALATORS: RegExp[] = [
  /\b(?:urgent|urgently|asap|immediately|critical|right away)\b/i,
  /\b(?:high priority|top priority|time.?sensitive)\b/i,
  /\b(?:before (?:end of day|eod|close of business|cob|tomorrow))\b/i,
];

const PRIORITY_DEESCALATORS: RegExp[] = [
  /\b(?:when you get a chance|no rush|low priority|whenever|at your convenience)\b/i,
  /\b(?:not urgent|can wait|no hurry)\b/i,
];

export function detectTaskIntent(aiResponseText: string): TaskIntent {
  const text = aiResponseText.trim();

  if (text.length < 20) {
    return { detected: false, title: "", description: "", priority: "medium", category: "", confidence: 0 };
  }

  let bestMatch: { category: string; priority: "low" | "medium" | "high" | "urgent"; confidence: number } | null = null;

  for (const { pattern, category, priority } of TASK_TRIGGER_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const confidence = match[0].length / text.length + 0.5;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { category, priority, confidence: Math.min(confidence, 1) };
      }
    }
  }

  if (!bestMatch) {
    return { detected: false, title: "", description: "", priority: "medium", category: "", confidence: 0 };
  }

  let { priority } = bestMatch;
  for (const pat of PRIORITY_ESCALATORS) {
    if (pat.test(text)) {
      priority = priority === "low" ? "medium" : priority === "medium" ? "high" : "urgent";
      break;
    }
  }
  for (const pat of PRIORITY_DEESCALATORS) {
    if (pat.test(text)) {
      priority = priority === "urgent" ? "high" : priority === "high" ? "medium" : "low";
      break;
    }
  }

  const title = extractTaskTitle(text);
  const description = extractTaskDescription(text);

  return {
    detected: bestMatch.confidence >= 0.5,
    title,
    description,
    priority,
    category: bestMatch.category,
    confidence: bestMatch.confidence,
  };
}

function extractTaskTitle(text: string): string {
  const patterns = [
    /(?:i'll|i will|let me)\s+(.+?)(?:\.|,|\band\b|$)/i,
    /(?:action item|todo|to-do|next step|follow[- ]?up)\s*:?\s*(.+?)(?:\.|,|$)/i,
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      let title = match[1].trim();
      if (title.length > 80) {
        title = title.substring(0, 77) + "...";
      }
      return title.charAt(0).toUpperCase() + title.slice(1);
    }
  }

  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
  if (sentences.length > 0) {
    const first = sentences[0].trim();
    return first.length > 80 ? first.substring(0, 77) + "..." : first;
  }

  return "Task from conversation";
}

function extractTaskDescription(text: string): string {
  if (text.length <= 200) return text;
  return text.substring(0, 197) + "...";
}

export function shouldCreateTaskFromConversation(intent: TaskIntent): boolean {
  return intent.detected && intent.confidence >= 0.55;
}
