import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler } from "../middlewares/errorHandler";

vi.mock("@clerk/express", () => ({
  getAuth: vi.fn(() => ({ userId: "user_test", orgId: "org_test" })),
  clerkMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: any[]) => args),
  and: vi.fn((...args: any[]) => args),
}));

vi.mock("@workspace/db", () => {
  const db = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, orgId: 1, toolId: 1, status: "connected" }]),
  };
  return {
    db,
    toolRegistry: { id: "id", name: "name", isActive: "isActive" },
    integrations: { id: "id", orgId: "orgId", toolId: "toolId", status: "status" },
  };
});

vi.mock("../lib/auth-helpers", () => ({
  getAuthContext: vi.fn().mockResolvedValue({
    orgId: 1,
    userId: 1,
    clerkUserId: "user_test",
    clerkOrgId: "org_test",
    isOwner: false,
  }),
}));

vi.mock("../middlewares/planLimits", () => ({
  requirePlanLimit: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../lib/billing/metering", () => ({
  recordUsage: vi.fn().mockResolvedValue(undefined),
  checkAllCountBasedLimits: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/encryption", () => ({
  encryptConnectionConfig: vi.fn(() => "encrypted-config"),
  decryptConnectionConfig: vi.fn(() => ({ accessToken: "test-token" })),
}));

vi.mock("../middlewares/validate", () => ({
  validate: () => (_req: any, _res: any, next: any) => next(),
}));

import integrationsRouter, { oauthStateStore } from "../routes/integrations";
import { db } from "@workspace/db";

const mockDb = db as any;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", integrationsRouter);
  app.use(errorHandler);
  return app;
}

describe("GET /api/integrations/oauth/:provider/authorize", () => {
  let app: express.Express;

  beforeEach(() => {
    app = buildApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.SLACK_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
  });

  it("returns authorize URL for valid provider with client ID", async () => {
    process.env.SLACK_CLIENT_ID = "test-slack-client-id";

    const res = await request(app).get("/api/integrations/oauth/slack/authorize");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("url");
    expect(res.body.url).toContain("https://slack.com/oauth/v2/authorize");
    expect(res.body.url).toContain("client_id=test-slack-client-id");
    expect(res.body.url).toContain("state=");
    expect(res.body.url).toContain("response_type=code");
  });

  it("returns authorize URL for google-workspace provider", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-google-client-id";

    const res = await request(app).get("/api/integrations/oauth/google-workspace/authorize");

    expect(res.status).toBe(200);
    expect(res.body.url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(res.body.url).toContain("client_id=test-google-client-id");
    expect(res.body.url).toContain("access_type=offline");
    expect(res.body.url).toContain("prompt=consent");
  });

  it("returns 400 for unsupported OAuth provider", async () => {
    const res = await request(app).get("/api/integrations/oauth/unknown-provider/authorize");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Unsupported OAuth provider");
  });

  it("returns 400 when client ID is not configured", async () => {
    const res = await request(app).get("/api/integrations/oauth/slack/authorize");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("not configured");
  });

  it("includes correct scopes for slack (comma-separated)", async () => {
    process.env.SLACK_CLIENT_ID = "test-slack-client-id";

    const res = await request(app).get("/api/integrations/oauth/slack/authorize");

    expect(res.status).toBe(200);
    const url = new URL(res.body.url);
    const scope = url.searchParams.get("scope");
    expect(scope).toContain("channels:read");
    expect(scope).toContain("chat:write");
  });

  it("includes correct scopes for google (space-separated)", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-google-client-id";

    const res = await request(app).get("/api/integrations/oauth/google-workspace/authorize");

    expect(res.status).toBe(200);
    const url = new URL(res.body.url);
    const scope = url.searchParams.get("scope");
    expect(scope).toContain("googleapis.com");
  });
});

describe("GET /api/integrations/oauth/:provider/callback", () => {
  let app: express.Express;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    app = buildApp();
    originalFetch = global.fetch;
    vi.clearAllMocks();
    process.env.SLACK_CLIENT_ID = "test-slack-client-id";
    process.env.SLACK_CLIENT_SECRET = "test-slack-secret";
    process.env.GOOGLE_CLIENT_ID = "test-google-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.SLACK_CLIENT_ID;
    delete process.env.SLACK_CLIENT_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.FRONTEND_URL;
    oauthStateStore.clear();
  });

  async function getStateForProvider(provider: string): Promise<string> {
    const envKey = `${provider === "google-workspace" ? "GOOGLE" : provider.toUpperCase()}_CLIENT_ID`;
    process.env[envKey] = process.env[envKey] || "test-id";

    const res = await request(app).get(`/api/integrations/oauth/${provider}/authorize`);
    const url = new URL(res.body.url);
    return url.searchParams.get("state")!;
  }

  it("returns 400 for unsupported provider on callback", async () => {
    const res = await request(app)
      .get("/api/integrations/oauth/unknown-provider/callback?code=abc&state=xyz");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Unsupported OAuth provider");
  });

  it("returns 400 when code or state is missing", async () => {
    const res = await request(app)
      .get("/api/integrations/oauth/slack/callback");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing code or state");
  });

  it("returns 400 when state is missing but code is present", async () => {
    const res = await request(app)
      .get("/api/integrations/oauth/slack/callback?code=test-code");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing code or state");
  });

  it("returns 400 for invalid state parameter", async () => {
    const res = await request(app)
      .get("/api/integrations/oauth/slack/callback?code=test-code&state=invalid-state-value");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid or expired state");
  });

  it("returns 400 for expired state", async () => {
    const state = await getStateForProvider("slack");

    const entry = oauthStateStore.get(state);
    if (entry) {
      entry.expiresAt = Date.now() - 1000;
    }

    const res = await request(app)
      .get(`/api/integrations/oauth/slack/callback?code=test-code&state=${state}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid or expired state");
  });

  it("returns 500 when Slack returns an error in token exchange", async () => {
    const state = await getStateForProvider("slack");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: false, error: "invalid_code" }),
    }) as Mock;

    const res = await request(app)
      .get(`/api/integrations/oauth/slack/callback?code=bad-code&state=${state}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toContain("Slack token exchange failed");
  });

  it("returns 500 when token exchange returns no access token", async () => {
    const state = await getStateForProvider("slack");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    }) as Mock;

    const res = await request(app)
      .get(`/api/integrations/oauth/slack/callback?code=test-code&state=${state}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toContain("no access token");
  });

  it("redirects on successful Slack OAuth callback", async () => {
    const state = await getStateForProvider("slack");
    process.env.FRONTEND_URL = "https://example.com";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ok: true,
        access_token: "xoxb-new-token",
        refresh_token: "xoxr-refresh",
        token_type: "Bearer",
        expires_in: 43200,
        scope: "channels:read,chat:write",
        team: { id: "T123", name: "Test Team" },
      }),
    }) as Mock;

    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where
      .mockResolvedValueOnce([{ id: 1, name: "slack", displayName: "Slack" }])
      .mockResolvedValueOnce([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.returning.mockResolvedValue([{ id: 1 }]);

    const res = await request(app)
      .get(`/api/integrations/oauth/slack/callback?code=valid-code&state=${state}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://example.com/integrations?connected=slack");
  });

  it("returns 500 for GitHub error in token exchange", async () => {
    process.env.GITHUB_CLIENT_ID = "test-gh-id";
    process.env.GITHUB_CLIENT_SECRET = "test-gh-secret";

    const state = await getStateForProvider("github");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: "bad_verification_code", error_description: "The code has expired" }),
    }) as Mock;

    const res = await request(app)
      .get(`/api/integrations/oauth/github/callback?code=expired&state=${state}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toContain("GitHub token exchange failed");
  });
});
