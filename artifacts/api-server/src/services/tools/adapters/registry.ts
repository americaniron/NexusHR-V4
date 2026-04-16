import type { ToolAdapter } from "./types";
import { slackAdapter } from "./slack";
import { googleAdapter } from "./google";
import { hubspotAdapter } from "./hubspot";
import { jiraAdapter } from "./jira";
import { githubAdapter } from "./github";

const adapterByName = new Map<string, ToolAdapter>();
const adapterByProvider = new Map<string, ToolAdapter>();

adapterByName.set("slack", slackAdapter);
adapterByName.set("google-workspace", googleAdapter);
adapterByName.set("hubspot", hubspotAdapter);
adapterByName.set("jira", jiraAdapter);
adapterByName.set("github", githubAdapter);

adapterByProvider.set("slack", slackAdapter);
adapterByProvider.set("google", googleAdapter);
adapterByProvider.set("hubspot", hubspotAdapter);
adapterByProvider.set("jira", jiraAdapter);
adapterByProvider.set("github", githubAdapter);

export function getAdapterByProvider(provider: string): ToolAdapter | undefined {
  return adapterByProvider.get(provider.toLowerCase());
}

export function getAdapter(toolName: string): ToolAdapter | undefined {
  return adapterByName.get(toolName);
}

export function resolveAdapter(tool: { name: string; provider?: string | null }): ToolAdapter | undefined {
  if (tool.provider) {
    const byProvider = getAdapterByProvider(tool.provider);
    if (byProvider) return byProvider;
  }
  return getAdapter(tool.name);
}

export function hasAdapter(toolName: string): boolean {
  return adapterByName.has(toolName);
}

export function listAdapters(): string[] {
  return Array.from(adapterByName.keys());
}
