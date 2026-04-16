function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value || value.trim() === "") return fallback;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return fallback;
  const parsed = parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseNonEmptyString(value: string | undefined, fallback: string): string {
  if (!value || value.trim() === "") return fallback;
  return value.trim();
}

export const AI_CONFIG = {
  provider: parseNonEmptyString(process.env.AI_PROVIDER, "anthropic"),
  model: parseNonEmptyString(process.env.AI_MODEL, "claude-opus-4-6"),
  defaultMaxTokens: parsePositiveInt(process.env.AI_DEFAULT_MAX_TOKENS, 8192),
  refinementMaxTokens: parsePositiveInt(process.env.AI_REFINEMENT_MAX_TOKENS, 1024),
};
