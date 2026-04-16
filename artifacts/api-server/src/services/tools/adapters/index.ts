export type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";
export { getAdapter, hasAdapter, listAdapters } from "./registry";
export { slackAdapter } from "./slack";
export { googleAdapter } from "./google";
