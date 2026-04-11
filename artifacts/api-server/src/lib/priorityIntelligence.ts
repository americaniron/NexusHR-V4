export interface PriorityContext {
  rolePriorities?: string[];
  taskQueue?: Array<{
    id: number;
    title: string;
    priority: string;
    dueDate?: string;
    status: string;
  }>;
  orgPriorityMatrix?: Record<string, number>;
  slaDefinitions?: Array<{
    category: string;
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
  }>;
}

export interface PriorityAssessment {
  urgencyLevel: "low" | "medium" | "high" | "critical";
  promptInstructions: string;
  prioritizedTasks: Array<{ id: number; title: string; score: number }>;
}

export function assessPriority(context: PriorityContext): PriorityAssessment {
  const instructions: string[] = [];
  let urgencyLevel: PriorityAssessment["urgencyLevel"] = "medium";

  const prioritizedTasks: Array<{ id: number; title: string; score: number }> = [];

  if (context.taskQueue && context.taskQueue.length > 0) {
    const activeTasks = context.taskQueue.filter(t => t.status !== "completed" && t.status !== "cancelled");

    for (const task of activeTasks) {
      let score = 50;

      if (task.priority === "critical") score += 40;
      else if (task.priority === "high") score += 25;
      else if (task.priority === "medium") score += 10;

      if (task.dueDate) {
        const due = new Date(task.dueDate);
        const now = new Date();
        const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) score += 30;
        else if (hoursUntilDue < 4) score += 20;
        else if (hoursUntilDue < 24) score += 10;
      }

      if (context.orgPriorityMatrix) {
        const categoryKey = task.title.toLowerCase();
        for (const [keyword, weight] of Object.entries(context.orgPriorityMatrix)) {
          if (categoryKey.includes(keyword.toLowerCase())) {
            score += weight;
          }
        }
      }

      prioritizedTasks.push({ id: task.id, title: task.title, score });
    }

    prioritizedTasks.sort((a, b) => b.score - a.score);

    const criticalCount = activeTasks.filter(t => t.priority === "critical").length;
    const overdueCount = activeTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    if (criticalCount > 0 || overdueCount > 0) {
      urgencyLevel = "critical";
      instructions.push(
        `There are ${criticalCount} critical tasks and ${overdueCount} overdue items requiring immediate attention.`,
        "Communicate with maximum urgency. Prioritize these items above all else.",
      );
    } else if (activeTasks.length > 10) {
      urgencyLevel = "high";
      instructions.push(
        `The task queue has ${activeTasks.length} active items. Help the user prioritize effectively.`,
        "Suggest batching or delegation strategies when appropriate.",
      );
    }
  }

  if (context.slaDefinitions && context.slaDefinitions.length > 0) {
    instructions.push(
      "Be aware of the following SLA commitments when prioritizing work:",
      ...context.slaDefinitions.map(sla =>
        `- ${sla.category}: respond within ${sla.responseTimeMinutes}min, resolve within ${sla.resolutionTimeMinutes}min`
      ),
    );
  }

  if (context.rolePriorities && context.rolePriorities.length > 0) {
    instructions.push(
      `Your role-specific priorities are: ${context.rolePriorities.join(", ")}. Weight your responses and suggestions accordingly.`
    );
  }

  return {
    urgencyLevel,
    promptInstructions: instructions.length > 0
      ? `## Priority & Urgency Context\n${instructions.join("\n")}`
      : "",
    prioritizedTasks,
  };
}
