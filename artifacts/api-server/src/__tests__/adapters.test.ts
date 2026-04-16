import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import type { OAuthCredentials } from "../services/tools/adapters/types";
import { slackAdapter } from "../services/tools/adapters/slack";
import { googleAdapter } from "../services/tools/adapters/google";
import { hubspotAdapter } from "../services/tools/adapters/hubspot";
import { jiraAdapter } from "../services/tools/adapters/jira";
import { githubAdapter } from "../services/tools/adapters/github";
import { getAdapter, hasAdapter, listAdapters, resolveAdapter, getAdapterByProvider } from "../services/tools/adapters/registry";

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
    expect(adapters).toContain("hubspot");
    expect(adapters).toContain("jira");
    expect(adapters).toContain("github");
    expect(adapters.length).toBe(5);
  });

  it("returns hubspot adapter", () => {
    expect(getAdapter("hubspot")).toBe(hubspotAdapter);
    expect(hasAdapter("hubspot")).toBe(true);
  });

  it("returns jira adapter", () => {
    expect(getAdapter("jira")).toBe(jiraAdapter);
    expect(hasAdapter("jira")).toBe(true);
  });

  it("returns github adapter", () => {
    expect(getAdapter("github")).toBe(githubAdapter);
    expect(hasAdapter("github")).toBe(true);
  });

  it("resolves adapter by provider field", () => {
    expect(getAdapterByProvider("slack")).toBe(slackAdapter);
    expect(getAdapterByProvider("google")).toBe(googleAdapter);
    expect(getAdapterByProvider("hubspot")).toBe(hubspotAdapter);
    expect(getAdapterByProvider("jira")).toBe(jiraAdapter);
    expect(getAdapterByProvider("github")).toBe(githubAdapter);
    expect(getAdapterByProvider("Slack")).toBe(slackAdapter);
    expect(getAdapterByProvider("unknown")).toBeUndefined();
  });

  it("resolveAdapter prefers provider over name", () => {
    const tool = { name: "some-custom-name", provider: "slack" };
    expect(resolveAdapter(tool)).toBe(slackAdapter);
  });

  it("resolveAdapter falls back to name when provider is null", () => {
    const tool = { name: "slack", provider: null };
    expect(resolveAdapter(tool)).toBe(slackAdapter);
  });

  it("resolveAdapter falls back to name when provider has no adapter", () => {
    const tool = { name: "google-workspace", provider: "nonexistent" };
    expect(resolveAdapter(tool)).toBe(googleAdapter);
  });

  it("resolveAdapter returns undefined when neither matches", () => {
    const tool = { name: "unknown", provider: "nonexistent" };
    expect(resolveAdapter(tool)).toBeUndefined();
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

describe("HubSpot Adapter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const hubspotCreds: OAuthCredentials = {
    accessToken: "hs-test-token",
    refreshToken: "hs-refresh-token",
    expiresAt: Date.now() + 3600000,
  };

  it("has correct provider name", () => {
    expect(hubspotAdapter.provider).toBe("HubSpot");
  });

  it("reads contacts list", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [{ id: "1", properties: { email: "test@example.com" } }] }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "contacts" }, hubspotCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/crm/v3/objects/contacts"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer hs-test-token" }) }),
    );
  });

  it("reads a specific contact", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123", properties: { email: "test@example.com" } }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "contacts", contactId: "123" }, hubspotCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/crm/v3/objects/contacts/123"),
      expect.any(Object),
    );
  });

  it("reads deals list", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [{ id: "1", properties: { dealname: "Big Deal" } }] }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "deals" }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("reads a specific deal", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "456", properties: { dealname: "Deal" } }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "deals", dealId: "456" }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("reads companies", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "companies" }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("rejects unknown resource type for read", async () => {
    const result = await hubspotAdapter.execute("read", { resourceType: "tickets" }, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown HubSpot resource type");
  });

  it("creates a contact", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "new-1", properties: { email: "new@example.com" } }),
    }) as Mock;

    const result = await hubspotAdapter.execute("write", {
      resourceType: "contacts",
      properties: { email: "new@example.com", firstname: "Test" },
    }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("updates a contact", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123", properties: { firstname: "Updated" } }),
    }) as Mock;

    const result = await hubspotAdapter.execute("write", {
      resourceType: "contacts",
      contactId: "123",
      properties: { firstname: "Updated" },
    }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("fails creating contact without properties", async () => {
    const result = await hubspotAdapter.execute("write", { resourceType: "contacts" }, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("properties");
  });

  it("creates a deal", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "d-1", properties: { dealname: "New Deal" } }),
    }) as Mock;

    const result = await hubspotAdapter.execute("write", {
      resourceType: "deals",
      properties: { dealname: "New Deal", amount: "5000" },
    }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("fails creating deal without dealname", async () => {
    const result = await hubspotAdapter.execute("write", {
      resourceType: "deals",
      properties: { amount: "5000" },
    }, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("dealname");
  });

  it("deletes a contact", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as Mock;

    const result = await hubspotAdapter.execute("delete", { resourceType: "contacts", contactId: "123" }, hubspotCreds);
    expect(result.success).toBe(true);
    expect((result.data as { deleted: boolean }).deleted).toBe(true);
  });

  it("fails deleting contact without contactId", async () => {
    const result = await hubspotAdapter.execute("delete", { resourceType: "contacts" }, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("contactId");
  });

  it("deletes a deal", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as Mock;

    const result = await hubspotAdapter.execute("delete", { resourceType: "deals", dealId: "456" }, hubspotCreds);
    expect(result.success).toBe(true);
  });

  it("handles HubSpot API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Contact not found" }),
    }) as Mock;

    const result = await hubspotAdapter.execute("read", { resourceType: "contacts", contactId: "999" }, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Contact not found");
  });

  it("rejects unsupported operation", async () => {
    const result = await hubspotAdapter.execute("update", {}, hubspotCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported HubSpot operation");
  });

  it("handles token refresh", async () => {
    process.env.HUBSPOT_CLIENT_ID = "test-hs-id";
    process.env.HUBSPOT_CLIENT_SECRET = "test-hs-secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "hs-new-token",
        refresh_token: "hs-new-refresh",
        expires_in: 21600,
      }),
    }) as Mock;

    const refreshed = await hubspotAdapter.refreshToken!({
      accessToken: "hs-expired",
      refreshToken: "hs-old-refresh",
      expiresAt: Date.now() - 1000,
    });
    expect(refreshed).not.toBeNull();
    expect(refreshed!.accessToken).toBe("hs-new-token");

    delete process.env.HUBSPOT_CLIENT_ID;
    delete process.env.HUBSPOT_CLIENT_SECRET;
  });

  it("returns null for refresh without refresh token", async () => {
    const result = await hubspotAdapter.refreshToken!({ accessToken: "test" });
    expect(result).toBeNull();
  });
});

describe("Jira Adapter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const jiraCreds: OAuthCredentials = {
    accessToken: "jira-test-token",
    refreshToken: "jira-refresh-token",
    expiresAt: Date.now() + 3600000,
  };

  it("has correct provider name", () => {
    expect(jiraAdapter.provider).toBe("Jira");
  });

  it("resolves cloud ID and reads issues", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: "cloud-123", name: "My Site" }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ issues: [{ key: "PROJ-1", fields: { summary: "Test" } }], total: 1 }),
      }) as Mock;

    const result = await jiraAdapter.execute("read", { resourceType: "issues" }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("reads a specific issue with cloudId", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ key: "PROJ-1", fields: { summary: "Test Issue" } }),
    }) as Mock;

    const result = await jiraAdapter.execute("read", {
      resourceType: "issues",
      issueKey: "PROJ-1",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rest/api/3/issue/PROJ-1"),
      expect.any(Object),
    );
  });

  it("reads projects", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [{ key: "PROJ", name: "Project" }] }),
    }) as Mock;

    const result = await jiraAdapter.execute("read", {
      resourceType: "projects",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("reads users", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ accountId: "u1", displayName: "User" }]),
    }) as Mock;

    const result = await jiraAdapter.execute("read", {
      resourceType: "users",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("fails reading statuses without projectKey", async () => {
    const result = await jiraAdapter.execute("read", {
      resourceType: "statuses",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("projectKey is required");
  });

  it("creates an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ key: "PROJ-2", id: "10001" }),
    }) as Mock;

    const result = await jiraAdapter.execute("write", {
      resourceType: "issues",
      cloudId: "cloud-123",
      projectKey: "PROJ",
      summary: "New Task",
      description: "Task details",
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("fails creating issue without required params", async () => {
    const result = await jiraAdapter.execute("write", {
      resourceType: "issues",
      cloudId: "cloud-123",
      projectKey: "PROJ",
    }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("summary");
  });

  it("updates an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(null),
    }) as Mock;

    const result = await jiraAdapter.execute("write", {
      resourceType: "issues",
      cloudId: "cloud-123",
      issueKey: "PROJ-1",
      fields: { summary: "Updated Summary" },
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("adds a comment to an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "comment-1" }),
    }) as Mock;

    const result = await jiraAdapter.execute("write", {
      resourceType: "comments",
      cloudId: "cloud-123",
      issueKey: "PROJ-1",
      body: "This is a comment",
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("fails adding comment without body", async () => {
    const result = await jiraAdapter.execute("write", {
      resourceType: "comments",
      cloudId: "cloud-123",
      issueKey: "PROJ-1",
    }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("body");
  });

  it("transitions an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(null),
    }) as Mock;

    const result = await jiraAdapter.execute("write", {
      resourceType: "transitions",
      cloudId: "cloud-123",
      issueKey: "PROJ-1",
      transitionId: "31",
    }, jiraCreds);
    expect(result.success).toBe(true);
  });

  it("deletes an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as Mock;

    const result = await jiraAdapter.execute("delete", {
      resourceType: "issues",
      cloudId: "cloud-123",
      issueKey: "PROJ-1",
    }, jiraCreds);
    expect(result.success).toBe(true);
    expect((result.data as { deleted: boolean }).deleted).toBe(true);
  });

  it("fails deleting without issueKey", async () => {
    const result = await jiraAdapter.execute("delete", {
      resourceType: "issues",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("issueKey");
  });

  it("handles Jira API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ errorMessages: ["Issue does not exist"] }),
    }) as Mock;

    const result = await jiraAdapter.execute("read", {
      resourceType: "issues",
      issueKey: "PROJ-999",
      cloudId: "cloud-123",
    }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Issue does not exist");
  });

  it("rejects unsupported operation", async () => {
    const result = await jiraAdapter.execute("patch", { cloudId: "cloud-123" }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported Jira operation");
  });

  it("handles token refresh", async () => {
    process.env.JIRA_CLIENT_ID = "test-jira-id";
    process.env.JIRA_CLIENT_SECRET = "test-jira-secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "jira-new-token",
        refresh_token: "jira-new-refresh",
        expires_in: 3600,
        scope: "read:jira-work write:jira-work",
      }),
    }) as Mock;

    const refreshed = await jiraAdapter.refreshToken!({
      accessToken: "jira-expired",
      refreshToken: "jira-old-refresh",
      expiresAt: Date.now() - 1000,
    });
    expect(refreshed).not.toBeNull();
    expect(refreshed!.accessToken).toBe("jira-new-token");

    delete process.env.JIRA_CLIENT_ID;
    delete process.env.JIRA_CLIENT_SECRET;
  });

  it("returns null for refresh without refresh token", async () => {
    const result = await jiraAdapter.refreshToken!({ accessToken: "test" });
    expect(result).toBeNull();
  });

  it("fails when cloud ID cannot be resolved", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve([]),
    }) as Mock;

    const result = await jiraAdapter.execute("read", { resourceType: "issues" }, jiraCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cloud ID");
  });
});

describe("GitHub Adapter", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const githubCreds: OAuthCredentials = {
    accessToken: "ghp-test-token",
    refreshToken: "ghr-refresh-token",
    expiresAt: Date.now() + 3600000,
  };

  it("has correct provider name", () => {
    expect(githubAdapter.provider).toBe("GitHub");
  });

  it("reads user repos", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: "my-repo", full_name: "user/my-repo" }]),
    }) as Mock;

    const result = await githubAdapter.execute("read", { resourceType: "repos" }, githubCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/user/repos"),
      expect.any(Object),
    );
  });

  it("reads repos by owner", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: "repo1" }]),
    }) as Mock;

    const result = await githubAdapter.execute("read", { resourceType: "repos", owner: "octocat" }, githubCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/octocat/repos"),
      expect.any(Object),
    );
  });

  it("reads a specific repo", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: "my-repo", full_name: "octocat/my-repo" }),
    }) as Mock;

    const result = await githubAdapter.execute("read", { resourceType: "repos", owner: "octocat", repo: "my-repo" }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("reads issues from a repo", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ number: 1, title: "Bug" }]),
    }) as Mock;

    const result = await githubAdapter.execute("read", {
      resourceType: "issues",
      owner: "octocat",
      repo: "my-repo",
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("reads a specific issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ number: 42, title: "Fix bug" }),
    }) as Mock;

    const result = await githubAdapter.execute("read", {
      resourceType: "issues",
      owner: "octocat",
      repo: "my-repo",
      issueNumber: 42,
    }, githubCreds);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/repos/octocat/my-repo/issues/42"),
      expect.any(Object),
    );
  });

  it("fails reading issues without owner/repo", async () => {
    const result = await githubAdapter.execute("read", { resourceType: "issues" }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("owner and repo are required");
  });

  it("reads pull requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ number: 1, title: "Feature PR" }]),
    }) as Mock;

    const result = await githubAdapter.execute("read", {
      resourceType: "pulls",
      owner: "octocat",
      repo: "my-repo",
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("reads a specific PR", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ number: 5, title: "PR" }),
    }) as Mock;

    const result = await githubAdapter.execute("read", {
      resourceType: "prs",
      owner: "octocat",
      repo: "my-repo",
      prNumber: 5,
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("reads authenticated user", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ login: "octocat", id: 1 }),
    }) as Mock;

    const result = await githubAdapter.execute("read", { resourceType: "user" }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("rejects unknown resource type", async () => {
    const result = await githubAdapter.execute("read", { resourceType: "gists" }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown GitHub resource type");
  });

  it("creates an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ number: 10, title: "New Issue" }),
    }) as Mock;

    const result = await githubAdapter.execute("write", {
      resourceType: "issues",
      owner: "octocat",
      repo: "my-repo",
      title: "New Issue",
      body: "Issue body",
      labels: ["bug"],
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("updates an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ number: 10, title: "Updated", state: "closed" }),
    }) as Mock;

    const result = await githubAdapter.execute("write", {
      resourceType: "issues",
      owner: "octocat",
      repo: "my-repo",
      issueNumber: 10,
      state: "closed",
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("fails creating issue without title", async () => {
    const result = await githubAdapter.execute("write", {
      resourceType: "issues",
      owner: "octocat",
      repo: "my-repo",
    }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("title is required");
  });

  it("creates a pull request", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ number: 20, title: "Feature" }),
    }) as Mock;

    const result = await githubAdapter.execute("write", {
      resourceType: "pulls",
      owner: "octocat",
      repo: "my-repo",
      title: "Feature",
      head: "feature-branch",
      base: "main",
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("fails creating PR without required params", async () => {
    const result = await githubAdapter.execute("write", {
      resourceType: "pulls",
      owner: "octocat",
      repo: "my-repo",
      title: "Feature",
    }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("head, and base are required");
  });

  it("adds a comment to an issue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 100, body: "Comment" }),
    }) as Mock;

    const result = await githubAdapter.execute("write", {
      resourceType: "comments",
      owner: "octocat",
      repo: "my-repo",
      issueNumber: 1,
      body: "Comment",
    }, githubCreds);
    expect(result.success).toBe(true);
  });

  it("deletes a comment", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 }) as Mock;

    const result = await githubAdapter.execute("delete", {
      resourceType: "comments",
      owner: "octocat",
      repo: "my-repo",
      commentId: 100,
    }, githubCreds);
    expect(result.success).toBe(true);
    expect((result.data as { deleted: boolean }).deleted).toBe(true);
  });

  it("fails deleting comment without commentId", async () => {
    const result = await githubAdapter.execute("delete", {
      resourceType: "comments",
      owner: "octocat",
      repo: "my-repo",
    }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("commentId");
  });

  it("handles GitHub API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Not Found" }),
    }) as Mock;

    const result = await githubAdapter.execute("read", {
      resourceType: "repos",
      owner: "octocat",
      repo: "nonexistent",
    }, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Not Found");
  });

  it("rejects unsupported operation", async () => {
    const result = await githubAdapter.execute("patch", {}, githubCreds);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported GitHub operation");
  });

  it("handles token refresh", async () => {
    process.env.GITHUB_CLIENT_ID = "test-gh-id";
    process.env.GITHUB_CLIENT_SECRET = "test-gh-secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "ghp-new-token",
        refresh_token: "ghr-new-refresh",
        token_type: "bearer",
        expires_in: 28800,
        scope: "repo,read:user",
      }),
    }) as Mock;

    const refreshed = await githubAdapter.refreshToken!({
      accessToken: "ghp-expired",
      refreshToken: "ghr-old-refresh",
      expiresAt: Date.now() - 1000,
    });
    expect(refreshed).not.toBeNull();
    expect(refreshed!.accessToken).toBe("ghp-new-token");

    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  it("returns null for refresh without refresh token", async () => {
    const result = await githubAdapter.refreshToken!({ accessToken: "test" });
    expect(result).toBeNull();
  });

  it("returns null when refresh API returns error", async () => {
    process.env.GITHUB_CLIENT_ID = "test-gh-id";
    process.env.GITHUB_CLIENT_SECRET = "test-gh-secret";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: "bad_refresh_token" }),
    }) as Mock;

    const result = await githubAdapter.refreshToken!({
      accessToken: "ghp-expired",
      refreshToken: "ghr-bad-refresh",
    });
    expect(result).toBeNull();

    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });
});
