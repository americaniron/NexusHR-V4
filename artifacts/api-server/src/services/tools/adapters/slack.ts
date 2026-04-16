import type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";

const SLACK_API = "https://slack.com/api";

async function slackRequest(
  method: string,
  token: string,
  body?: Record<string, unknown>,
): Promise<AdapterResult> {
  const response = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!data.ok) {
    return { success: false, error: data.error || "Slack API error" };
  }
  return { success: true, data };
}

export const slackAdapter: ToolAdapter = {
  provider: "Slack",

  async execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult> {
    const token = credentials.accessToken;

    switch (operation) {
      case "read": {
        const resourceType = parameters.resourceType as string | undefined;

        if (resourceType === "channel" || resourceType === "channels") {
          return slackRequest("conversations.list", token, {
            types: (parameters.types as string) || "public_channel,private_channel",
            limit: (parameters.limit as number) || 100,
          });
        }

        if (resourceType === "message" || resourceType === "messages" || resourceType === "history") {
          const channel = parameters.channel as string;
          if (!channel) return { success: false, error: "channel parameter is required for reading messages" };
          return slackRequest("conversations.history", token, {
            channel,
            limit: (parameters.limit as number) || 50,
            ...(parameters.oldest ? { oldest: parameters.oldest } : {}),
            ...(parameters.latest ? { latest: parameters.latest } : {}),
          });
        }

        if (resourceType === "user" || resourceType === "users") {
          return slackRequest("users.list", token, {
            limit: (parameters.limit as number) || 100,
          });
        }

        return slackRequest("conversations.list", token, { limit: 20 });
      }

      case "write": {
        const channel = parameters.channel as string;
        const text = parameters.text as string;
        if (!channel || !text) {
          return { success: false, error: "channel and text parameters are required" };
        }
        return slackRequest("chat.postMessage", token, {
          channel,
          text,
          ...(parameters.thread_ts ? { thread_ts: parameters.thread_ts } : {}),
          ...(parameters.blocks ? { blocks: parameters.blocks } : {}),
        });
      }

      case "delete": {
        const channel = parameters.channel as string;
        const ts = parameters.ts as string;
        if (!channel || !ts) {
          return { success: false, error: "channel and ts parameters are required" };
        }
        return slackRequest("chat.delete", token, { channel, ts });
      }

      default:
        return { success: false, error: `Unsupported Slack operation: ${operation}` };
    }
  },
};
