export const SUPPORTED_PROVIDERS = ["anthropic"] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

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

function parseProvider(value: string | undefined, fallback: SupportedProvider): SupportedProvider {
  if (!value || value.trim() === "") return fallback;
  const trimmed = value.trim().toLowerCase();
  if (!(SUPPORTED_PROVIDERS as readonly string[]).includes(trimmed)) {
    console.error(
      `[aiConfig] Invalid AI_PROVIDER "${trimmed}". ` +
      `Supported providers: ${SUPPORTED_PROVIDERS.join(", ")}. ` +
      `Falling back to "${fallback}".`
    );
    return fallback;
  }
  return trimmed as SupportedProvider;
}

const DEFAULT_PROVIDER = "anthropic";
const DEFAULT_MODEL = "claude-opus-4-6";
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_REFINEMENT_MAX_TOKENS = 1024;

export const AI_CONFIG = {
  provider: parseProvider(process.env.AI_PROVIDER, DEFAULT_PROVIDER),
  model: parseNonEmptyString(process.env.AI_MODEL, DEFAULT_MODEL),
  defaultMaxTokens: parsePositiveInt(process.env.AI_DEFAULT_MAX_TOKENS, DEFAULT_MAX_TOKENS),
  refinementMaxTokens: parsePositiveInt(process.env.AI_REFINEMENT_MAX_TOKENS, DEFAULT_REFINEMENT_MAX_TOKENS),
};

export const AI_CONFIG_ALL_DEFAULTS =
  AI_CONFIG.provider === DEFAULT_PROVIDER &&
  AI_CONFIG.model === DEFAULT_MODEL &&
  AI_CONFIG.defaultMaxTokens === DEFAULT_MAX_TOKENS &&
  AI_CONFIG.refinementMaxTokens === DEFAULT_REFINEMENT_MAX_TOKENS &&
  !process.env.AI_PROVIDER &&
  !process.env.AI_MODEL &&
  !process.env.AI_DEFAULT_MAX_TOKENS &&
  !process.env.AI_REFINEMENT_MAX_TOKENS;
