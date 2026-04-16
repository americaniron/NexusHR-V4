import type { ToolAdapter } from "./types";
import { slackAdapter } from "./slack";
import { googleAdapter } from "./google";

const adapterMap = new Map<string, ToolAdapter>();

adapterMap.set("slack", slackAdapter);
adapterMap.set("google-workspace", googleAdapter);

export function getAdapter(toolName: string): ToolAdapter | undefined {
  return adapterMap.get(toolName);
}

export function hasAdapter(toolName: string): boolean {
  return adapterMap.has(toolName);
}

export function listAdapters(): string[] {
  return Array.from(adapterMap.keys());
}
