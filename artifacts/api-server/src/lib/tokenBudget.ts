export interface TokenBudgetConfig {
  totalBudget: number;
  layerPriorities: Record<string, LayerPriority>;
}

export interface LayerPriority {
  priority: "critical" | "high" | "medium" | "low";
  minTokens: number;
  maxTokens: number;
  truncationStrategy: "none" | "trim_end" | "trim_old" | "summarize";
}

export interface TokenAllocation {
  layer: string;
  allocated: number;
  used: number;
  truncated: boolean;
  originalTokens: number;
}

export interface BudgetResult {
  allocations: TokenAllocation[];
  totalUsed: number;
  totalBudget: number;
  overBudget: boolean;
  truncations: Array<{ layer: string; from: number; to: number; strategy: string }>;
}

const DEFAULT_BUDGET = 128000;

const DEFAULT_PRIORITIES: Record<string, LayerPriority> = {
  system: { priority: "critical", minTokens: 500, maxTokens: 2000, truncationStrategy: "none" },
  compliance: { priority: "critical", minTokens: 200, maxTokens: 1000, truncationStrategy: "none" },
  role_definition: { priority: "high", minTokens: 200, maxTokens: 1500, truncationStrategy: "trim_end" },
  job_instructions: { priority: "high", minTokens: 200, maxTokens: 3000, truncationStrategy: "trim_end" },
  task_instructions: { priority: "high", minTokens: 100, maxTokens: 2000, truncationStrategy: "trim_end" },
  tool_access: { priority: "medium", minTokens: 100, maxTokens: 1000, truncationStrategy: "trim_end" },
  company_context: { priority: "medium", minTokens: 100, maxTokens: 1500, truncationStrategy: "summarize" },
  user_context: { priority: "medium", minTokens: 100, maxTokens: 1000, truncationStrategy: "summarize" },
  memory_context: { priority: "low", minTokens: 50, maxTokens: 2000, truncationStrategy: "trim_old" },
};

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.5);
}

export function allocateTokenBudget(
  layerContents: Record<string, string>,
  config?: Partial<TokenBudgetConfig>,
): BudgetResult {
  const totalBudget = config?.totalBudget || DEFAULT_BUDGET;
  const priorities = { ...DEFAULT_PRIORITIES, ...(config?.layerPriorities || {}) };

  const layers = Object.keys(layerContents);
  const tokenCounts: Record<string, number> = {};
  for (const layer of layers) {
    tokenCounts[layer] = estimateTokens(layerContents[layer]);
  }

  const totalRaw = Object.values(tokenCounts).reduce((sum, c) => sum + c, 0);

  if (totalRaw <= totalBudget) {
    return {
      allocations: layers.map(layer => ({
        layer,
        allocated: tokenCounts[layer],
        used: tokenCounts[layer],
        truncated: false,
        originalTokens: tokenCounts[layer],
      })),
      totalUsed: totalRaw,
      totalBudget,
      overBudget: false,
      truncations: [],
    };
  }

  const allocations: TokenAllocation[] = [];
  const truncations: Array<{ layer: string; from: number; to: number; strategy: string }> = [];

  let criticalUsed = 0;
  const criticalLayers: string[] = [];
  const highLayers: string[] = [];
  const mediumLayers: string[] = [];
  const lowLayers: string[] = [];

  for (const layer of layers) {
    const p = priorities[layer] || DEFAULT_PRIORITIES.memory_context;
    switch (p.priority) {
      case "critical": criticalLayers.push(layer); break;
      case "high": highLayers.push(layer); break;
      case "medium": mediumLayers.push(layer); break;
      case "low": lowLayers.push(layer); break;
    }
  }

  for (const layer of criticalLayers) {
    const tokens = tokenCounts[layer];
    allocations.push({
      layer,
      allocated: tokens,
      used: tokens,
      truncated: false,
      originalTokens: tokens,
    });
    criticalUsed += tokens;
  }

  if (criticalUsed >= totalBudget) {
    for (const layer of [...highLayers, ...mediumLayers, ...lowLayers]) {
      allocations.push({
        layer,
        allocated: 0,
        used: 0,
        truncated: true,
        originalTokens: tokenCounts[layer],
      });
      truncations.push({
        layer,
        from: tokenCounts[layer],
        to: 0,
        strategy: "dropped_budget_exhausted",
      });
    }

    return {
      allocations,
      totalUsed: criticalUsed,
      totalBudget,
      overBudget: criticalUsed > totalBudget,
      truncations,
    };
  }

  let remaining = totalBudget - criticalUsed;

  const truncatableGroups = [highLayers, mediumLayers, lowLayers];

  for (const group of truncatableGroups) {
    for (const layer of group) {
      const p = priorities[layer] || DEFAULT_PRIORITIES.memory_context;
      const rawTokens = tokenCounts[layer];

      if (remaining <= 0) {
        allocations.push({
          layer,
          allocated: 0,
          used: 0,
          truncated: true,
          originalTokens: rawTokens,
        });
        truncations.push({ layer, from: rawTokens, to: 0, strategy: "dropped_budget_exhausted" });
        continue;
      }

      const allocated = Math.min(rawTokens, Math.min(p.maxTokens, remaining));
      const truncated = rawTokens > allocated;

      allocations.push({
        layer,
        allocated,
        used: allocated,
        truncated,
        originalTokens: rawTokens,
      });

      if (truncated) {
        truncations.push({ layer, from: rawTokens, to: allocated, strategy: p.truncationStrategy });
      }

      remaining -= allocated;
    }
  }

  const totalUsed = allocations.reduce((sum, a) => sum + a.used, 0);

  return {
    allocations,
    totalUsed,
    totalBudget,
    overBudget: totalUsed > totalBudget,
    truncations,
  };
}

export function applyTruncation(content: string, maxTokens: number, strategy: string): string {
  const currentTokens = estimateTokens(content);
  if (currentTokens <= maxTokens) return content;

  const maxChars = Math.floor(maxTokens * 3.5);

  switch (strategy) {
    case "none":
      return content;

    case "trim_end":
      return content.slice(0, maxChars) + "\n[Content truncated due to token budget]";

    case "trim_old": {
      const lines = content.split("\n");
      const result: string[] = [];
      let charCount = 0;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (charCount + lines[i].length > maxChars - 50) break;
        result.unshift(lines[i]);
        charCount += lines[i].length + 1;
      }
      return "[Earlier context trimmed]\n" + result.join("\n");
    }

    case "summarize":
      return content.slice(0, maxChars) + "\n[Remaining content summarized due to token budget]";

    default:
      return content.slice(0, maxChars);
  }
}
