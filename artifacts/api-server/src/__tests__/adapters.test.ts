import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import type { OAuthCredentials } from "../services/tools/adapters/types";
import { slackAdapter } from "../services/tools/adapters/slack";
import { googleAdapter } from "../services/tools/adapters/google";
import { getAdapter, hasAdapter, listAdapters } from "../services/tools/adapters/registry";

const mockCredentials: OAuthCredentials = {
  accessToken: "xoxb-test-token-123",
  refreshToken: "refresh-token-123",
  tokenType: "Bearer",
  expiresAt: Date.now() + 3600000,
  scope: "channels:read,chat:write",
};

describe("Adapter Registry", () => {
  it("returns slack adapter", () => {
    expect(getAdapter("slack")).toBe(slackAdapter);
    expect(hasAdapter("slack")).toBe(true);
  });

  it("returns google-workspace adapter", () => {
    expect(getAdapter("google-workspace")).toBe(googleAdapter);
    expect(hasAdapter("google-workspace")).toBe(true);
  });

  it("returns undefined for unknown provider", () => {
    expect(getAdapter("unknown")).toBeUndefined();
    expect(hasAdapter("unknown")).toBe(false);
  });

  it("lists all registered adapters", () => {
    const adapters = listAdapters();
    expect(adapters).toContain("slack");
    expect(adapters).toContain("google-workspace");
    expect(adapters.length).toBe(2);
  });
});

describe("Slack Adapter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("has correct provider name", () => {
    expect(slackAdapter.provider).toBe("Slack");
  });

  it("reads channels", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, channels: [{ id: "C123", name: "general" }] }),
    }) as Mock;

    const result = await slackAdapter.execute("read", { resourceType: "channels" }, mockCredentials);
    expect(result.success).toBe(true);
    expect((result.data as { channels: unknown[] }).channels).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://slack.com/api/conversations.list",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reads message history", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, messages: [{ text: "hello" }] }),
    }) as Mock;

    const result = await slackAdapter.execute("read", { resourceType: "messages", channel: "C123" }, mockCredentials);
    expect(result.success).toBe(true);
  });

  it("fails reading messages without channel", async () => {
    const result = await slackAdapter.execute("read", { resourceType: "messages" }, mockCredentials);
    expect(result.success).toBe(false);
    expect(result.error).toContain("channel parameter is required");
  });

  it("sends a message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, ts: "1234567890.123456" }),
    }) as Mock;

    const result = await slackAdapter.execute("write", { channel: "C123", text: "Hello world" }, mockCredentials);
    expect(result.success).toBe(true);
  });

  it("sends a threaded reply", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, ts: "1234567890.654321" }),
    }) as Mock;

    const result = await slackAdapter.execute("write", {
      channel: "C123", text: "Thread reply", thread_ts: "1234567890.123456",
    }, mockCredentials);
    expect(result.success).toBe(true);
  });

  it("fails sending without required params", async () => {
    const result = await slackAdapter.execute("write", { channel: "C123" }, mockCredentials);
    expect(result.success).toBe(false);
    expect(result.error).toContain("channel and text parameters are required");
  });

  it("deletes a message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true }),
    }) as Mock;

    const result = await slackAdapter.execute("delete", { channel: "C123", ts: "1234567890.123456" }, mockCredentials);
    expect(result.success).toBe(true);
  });

  it("handles Slack API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: false, error: "channel_not_found" }),
    }) as Mock;

    const result = await slackAdapter.execute("read", { resourceType: "channels" }, mockCredentials);
    expect(result.success).toBe(false);
    expect(result.error).toBe("channel_not_found");
  });

  it("rejects unsupported operation", async () => {
    const result = await slackAdapter.execute("update", {}, mockCredentials);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported Slack operation");
  });

  it("handles Slack token refresh", async () => {
    process.env.SLACK_CLIENT_ID = "test-slack-client-id";
    process.env.SLACK_CLIENT_SECRET = "test-slack-client-secret";

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        ok: true,
        access_token: "xoxb-new-token",
        refresh_token: "xoxr-new-refresh",
        token_type: "Bearer",
        expires_in: 43200,
        scope: "channels:read,chat:write",
      }),
    }) as Mock;

    const expiredCreds: OAuthCredentials = {
      accessToken: "xoxb-expired",
      refreshToken: "xoxr-old-refresh",
      expiresAt: Date.now() - 1000,
    };

    const refreshed = await slackAdapter.refreshToken!(expiredCreds);
    expect(refreshed).not.toBeNull();
    expect(refreshed!.accessToken).toBe("xoxb-new-token");
    expect(refreshed!.refreshToken).toBe("xoxr-new-refresh");

    delete process.env.SLACK_CLIENT_ID;
    delete process.env.SLACK_CLIENT_SECRET;
  });

  it("returns null for Slack refresh without refresh token", async () => {
    const result = await slackAdapter.refreshToken!({ accessToken: "test" });
    expect(result).toBeNull();
  });

  it("returns null for Slack refresh when API fails", async () => {
    process.env.SLACK_CLIENT_ID = "test-id";
    process.env.SLACK_CLIENT_SECRET = "test-secret";

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: false, error: "invalid_refresh_token" }),
    }) as Mock;

    const result = await slackAdapter.refreshToken!({
      accessToken: "expired",
      refreshToken: "bad-refresh",
    });
    expect(result).toBeNull();

    delete process.env.SLACK_CLIENT_ID;
    delete process.env.SLACK_CLIENT_SECRET;
  });
});

describe("Google Adapter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const googleCreds: OAuthCredentials = {
    accessToken: "ya29.test-token",
    refreshToken: "1//test-refresh",
    expiresAt: Date.now() + 3600000,
  };

  it("has correct provider name", () => {
    expect(googleAdapter.provider).toBe("Google");
  });

  it("reads Gmail messages list", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: "msg1" }], resultSizeEstimate: 1 }),
    }) as Mock;

    const result = await googleAdapter.execute("read", { service: "gmail" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("reads a specific Gmail message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "msg1", snippet: "Hello" }),
    }) as Mock;

    const result = await googleAdapter.execute("read", { service: "gmail", messageId: "msg1" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("reads calendar events", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "evt1", summary: "Meeting" }] }),
    }) as Mock;

    const result = await googleAdapter.execute("read", { service: "calendar" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("reads Drive files", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: [{ id: "file1", name: "doc.pdf" }] }),
    }) as Mock;

    const result = await googleAdapter.execute("read", { service: "drive" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("sends an email", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "sent1", labelIds: ["SENT"] }),
    }) as Mock;

    const result = await googleAdapter.execute("write", {
      service: "gmail", to: "test@example.com", subject: "Test", body: "<p>Hello</p>",
    }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("fails sending email without required params", async () => {
    const result = await googleAdapter.execute("write", { service: "gmail", to: "test@example.com" }, googleCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("to, subject, and body are required");
  });

  it("creates a calendar event", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "evt2", status: "confirmed" }),
    }) as Mock;

    const result = await googleAdapter.execute("write", {
      service: "calendar",
      summary: "Team Standup",
      start: "2026-04-17T09:00:00Z",
      end: "2026-04-17T09:30:00Z",
    }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("creates a Drive file", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "file2", name: "New Doc" }),
    }) as Mock;

    const result = await googleAdapter.execute("write", { service: "drive", name: "New Doc" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("trashes a Gmail message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "msg1", labelIds: ["TRASH"] }),
    }) as Mock;

    const result = await googleAdapter.execute("delete", { service: "gmail", messageId: "msg1" }, googleCreds);
    expect(result.success).toBe(true);
  });

  it("handles Google API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: "Unauthorized" } }),
    }) as Mock;

    const result = await googleAdapter.execute("read", { service: "gmail" }, googleCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("rejects unknown service", async () => {
    const result = await googleAdapter.execute("read", { service: "sheets" }, googleCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown Google service");
  });

  it("handles token refresh", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "ya29.new-token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid email",
      }),
    }) as Mock;

    const expiredCreds: OAuthCredentials = {
      accessToken: "ya29.expired",
      refreshToken: "1//refresh",
      expiresAt: Date.now() - 1000,
    };

    const refreshed = await googleAdapter.refreshToken!(expiredCreds);
    expect(refreshed).not.toBeNull();
    expect(refreshed!.accessToken).toBe("ya29.new-token");

    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  it("returns null for refresh without refresh token", async () => {
    const result = await googleAdapter.refreshToken!({ accessToken: "test" });
    expect(result).toBeNull();
  });
});
