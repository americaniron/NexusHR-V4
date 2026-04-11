import { createHash } from "crypto";
import { db } from "@workspace/db";
import { promptAuditLogs } from "@workspace/db/schema";
import type { AssembledPrompt } from "./promptAssembler";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_LAYERS = ["system", "role_definition", "compliance"];
const RECOMMENDED_LAYERS = ["job_instructions", "company_context"];

export function validatePrompt(assembled: AssembledPrompt): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!assembled.systemPrompt || assembled.systemPrompt.trim().length === 0) {
    errors.push("Assembled prompt is empty");
  }

  for (const layer of REQUIRED_LAYERS) {
    if (!assembled.layers[layer] || assembled.layers[layer].trim().length === 0) {
      errors.push(`Required layer '${layer}' is missing or empty`);
    }
  }

  for (const layer of RECOMMENDED_LAYERS) {
    if (!assembled.layers[layer] || assembled.layers[layer].trim().length === 0) {
      warnings.push(`Recommended layer '${layer}' is missing or empty`);
    }
  }

  if (assembled.tokenCount > assembled.tokenBudget) {
    errors.push(`Token count (${assembled.tokenCount}) exceeds budget (${assembled.tokenBudget})`);
  }

  if (assembled.tokenCount > assembled.tokenBudget * 0.9) {
    warnings.push(`Token usage at ${Math.round((assembled.tokenCount / assembled.tokenBudget) * 100)}% of budget`);
  }

  const systemLayer = assembled.layers.system || "";
  if (!systemLayer.includes("Safety Protocols") && !systemLayer.includes("safety")) {
    warnings.push("System layer may be missing safety protocols");
  }

  if (assembled.truncations.length > 0) {
    for (const t of assembled.truncations) {
      warnings.push(`Layer '${t.layer}' was truncated from ${t.from} to ${t.to} tokens (${t.strategy})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: "[EMAIL_REDACTED]" },
  { pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, replacement: "[SSN_REDACTED]" },
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: "[CARD_REDACTED]" },
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[PHONE_REDACTED]" },
  { pattern: /\b\+\d{1,3}[-.\s]?\d{3,14}\b/g, replacement: "[PHONE_REDACTED]" },
  { pattern: /\b\d{1,5}\s+[\w\s]+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Way)\b/gi, replacement: "[ADDRESS_REDACTED]" },
  { pattern: /\b(?:sk|pk|api|token|key|secret)[-_]?[A-Za-z0-9]{20,}\b/gi, replacement: "[API_KEY_REDACTED]" },
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi, replacement: "[PASSWORD_REDACTED]" },
];

export function redactPII(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

export async function logPromptAudit(
  orgId: number,
  userId: number | undefined,
  assembled: AssembledPrompt,
  validation: ValidationResult,
): Promise<void> {
  const redacted = redactPII(assembled.systemPrompt);
  const hash = hashPrompt(assembled.systemPrompt);

  const layersSummary: Record<string, { tokens: number; truncated: boolean }> = {};
  for (const [layer, content] of Object.entries(assembled.layers)) {
    const truncation = assembled.truncations.find(t => t.layer === layer);
    layersSummary[layer] = {
      tokens: Math.ceil((content?.length || 0) / 3.5),
      truncated: !!truncation,
    };
  }

  await db.insert(promptAuditLogs).values({
    orgId,
    userId: userId || null,
    aiEmployeeId: assembled.metadata.aiEmployeeId,
    templateVersion: assembled.metadata.templateVersion,
    layersSummary,
    assembledPromptHash: hash,
    redactedPrompt: redacted,
    tokenCount: assembled.tokenCount,
    tokenBudget: assembled.tokenBudget,
    truncationApplied: assembled.truncations.length > 0 ? assembled.truncations : null,
    validationResult: validation,
    assemblyDurationMs: assembled.metadata.assemblyDurationMs,
  });
}
