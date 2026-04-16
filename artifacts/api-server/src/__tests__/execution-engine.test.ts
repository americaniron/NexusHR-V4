import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

vi.mock("@workspace/db", () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    },
  };
});

vi.mock("../services/tools/permissionEngine", () => ({
  evaluatePermission: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("../services/tools/auditLogger", () => ({
  logToolAccess: vi.fn(),
}));

import { db } from "@workspace/db";
import { evaluatePermission, checkRateLimit } from "../services/tools/permissionEngine";
import { logToolAccess } from "../services/tools/auditLogger";
import { executeToolAccess } from "../services/tools/executionEngine";

function chainReturning(data: unknown[]) {
  return {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(data),
    }),
  };
}

function chainInsertReturning(data: unknown[]) {
  return {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(data),
    }),
  };
}

function chainUpdateReturning(data: unknown[]) {
  return {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(data),
      }),
    }),
  };
}

const mockTool = {
  id: 1,
  name: "slack",
  displayName: "Slack",
  category: "Communication",
  provider: "slack",
  authType: "oauth2",
  isActive: 1,
  requiredScopes: null,
  capabilities: null,
  rateLimits: null,
  healthEndpoint: null,
  documentationUrl: null,
  iconUrl: null,
  metadata: null,
  description: "Slack integration",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockConnection = {
  id: 10,
  orgId: 1,
  toolId: 1,
  status: "connected",
  connectedScopes: ["channels:read", "chat:write"],
  connectionConfig: {
    accessToken: "xoxb-real-token",
    refreshToken: "xoxr-refresh",
    tokenType: "Bearer",
    expiresAt: Date.now() + 3600000,
    scope: "channels:read,chat:write",
  },
  connectedAt: new Date(),
  disconnectedAt: null,
  lastHealthCheck: null,
  healthStatus: "healthy",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuditLog = { id: 100 };

describe("executeToolAccess — adapter routing", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();

    (evaluatePermission as Mock).mockResolvedValue({ allowed: true, reason: "test" });
    (checkRateLimit as Mock).mockResolvedValue({ allowed: true });
    (logToolAccess as Mock).mockResolvedValue(mockAuditLog);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function setupDbMocks() {
    let callCount = 0;
    (db.select as Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return chainReturning([mockTool]);
      return chainReturning([mockConnection]);
    });
    (db.insert as Mock).mockReturnValue(chainInsertReturning([mockAuditLog]));
    (db.update as Mock).mockReturnValue(chainUpdateReturning([{ ...mockAuditLog, result: "success" }]));
  }

  it("routes Slack tool through real adapter", async () => {
    setupDbMocks();

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, channels: [{ id: "C1", name: "general" }] }),
    }) as Mock;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "read",
      parameters: { resourceType: "channels" },
    });

    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect((result.result as { channels: unknown[] }).channels).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://slack.com/api/conversations.list",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer xoxb-real-token",
        }),
      }),
    );
  });

  it("passes resourceType from request into adapter parameters", async () => {
    setupDbMocks();

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, messages: [{ text: "hello" }] }),
    }) as Mock;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "read",
      resourceType: "messages",
      parameters: { channel: "C123" },
    });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://slack.com/api/conversations.history",
      expect.anything(),
    );
  });

  it("enforces permission checks before adapter execution", async () => {
    setupDbMocks();
    (evaluatePermission as Mock).mockResolvedValue({ allowed: false, reason: "insufficient permissions" });

    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "write",
      parameters: { channel: "C1", text: "hello" },
    });

    expect(result.success).toBe(false);
    expect(result.permissionDecision).toBe("denied");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("enforces rate limits before adapter execution", async () => {
    setupDbMocks();
    (checkRateLimit as Mock).mockResolvedValue({ allowed: false, retryAfter: 60, reason: "Rate limit exceeded" });

    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "read",
      parameters: { resourceType: "channels" },
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("creates audit log entry for adapter execution", async () => {
    setupDbMocks();

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, channels: [] }),
    }) as Mock;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "read",
      parameters: { resourceType: "channels" },
      requestId: "req-123",
    });

    expect(result.success).toBe(true);
    expect(result.auditLogId).toBe(100);
    expect(logToolAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 1,
        aiEmployeeId: 1,
        toolId: 1,
        operation: "read",
        requestId: "req-123",
      }),
    );
  });

  it("handles adapter execution errors gracefully", async () => {
    setupDbMocks();

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: false, error: "not_authed" }),
    }) as Mock;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "slack",
      operation: "read",
      parameters: { resourceType: "channels" },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("not_authed");
  });

  it("resolves adapter by provider field", async () => {
    const googleTool = { ...mockTool, id: 2, name: "gws-custom", provider: "google" };
    const googleConnection = {
      ...mockConnection,
      toolId: 2,
      connectionConfig: {
        accessToken: "ya29.google-token",
        expiresAt: Date.now() + 3600000,
      },
    };

    let callCount = 0;
    (db.select as Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return chainReturning([googleTool]);
      return chainReturning([googleConnection]);
    });
    (db.insert as Mock).mockReturnValue(chainInsertReturning([mockAuditLog]));
    (db.update as Mock).mockReturnValue(chainUpdateReturning([{ ...mockAuditLog, result: "success" }]));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: "m1" }] }),
    }) as Mock;

    const result = await executeToolAccess({
      orgId: 1,
      aiEmployeeId: 1,
      toolName: "gws-custom",
      operation: "read",
      parameters: { service: "gmail" },
    });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("gmail.googleapis.com"),
      expect.anything(),
    );
  });
});
