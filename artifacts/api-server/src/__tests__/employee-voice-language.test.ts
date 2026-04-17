import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("@clerk/express", () => ({
  getAuth: () => ({ userId: "test-user-123", sessionClaims: { userId: "test-user-123" } }),
}));

const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
const mockSet = vi.fn();
const mockUpdateWhere = vi.fn(() => ({ returning: mockReturning }));
const mockUpdateSetResult = { where: mockUpdateWhere };

const mockSelectWhere = vi.fn();

vi.mock("@workspace/db", () => {
  const aiEmployees = {
    id: "id",
    orgId: "org_id",
    roleId: "role_id",
    name: "name",
    status: "status",
    department: "department",
    voiceLanguage: "voice_language",
  };
  const aiEmployeeRoles = { id: "id" };
  const organizations = { clerkOrgId: "clerk_org_id" };
  const users = { clerkUserId: "clerk_user_id" };

  return {
    db: {
      select: () => ({
        from: (table: unknown) => ({
          where: (condition: unknown) => mockSelectWhere(table, condition),
        }),
      }),
      insert: (table: unknown) => {
        mockDbInsert(table);
        return { values: mockValues };
      },
      update: (table: unknown) => {
        mockDbUpdate(table);
        return {
          set: (data: unknown) => {
            mockSet(data);
            return mockUpdateSetResult;
          },
        };
      },
    },
    aiEmployees,
    aiEmployeeRoles,
    organizations,
    users,
    eq: (a: unknown, b: unknown) => ({ _eq: [a, b] }),
    and: (...args: unknown[]) => ({ _and: args }),
    sql: Object.assign((strings: TemplateStringsArray) => strings.join(""), { raw: (s: string) => s }),
  };
});

vi.mock("../lib/auth-helpers", () => ({
  getAuthContext: vi.fn().mockResolvedValue({
    orgId: 1,
    userId: 1,
    clerkUserId: "test-user-123",
    clerkOrgId: "org-123",
    isOwner: true,
  }),
  emptyPagination: () => ({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } }),
}));

vi.mock("../lib/websocket", () => ({
  publishEvent: vi.fn(),
}));

vi.mock("../lib/billing/metering", () => ({
  recordUsage: vi.fn().mockResolvedValue(undefined),
  checkAllCountBasedLimits: vi.fn().mockResolvedValue(undefined),
  checkPlanLimit: vi.fn().mockResolvedValue({ allowed: true, used: 0, limit: 100, remaining: 100 }),
}));

vi.mock("../middlewares/planLimits", () => ({
  requirePlanLimit: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../lib/avatars", () => ({
  getDiceBearFallback: (name: string) => `https://dicebear.com/${name}`,
}));

import { errorHandler } from "../middlewares/errorHandler";

const MOCK_ROLE = {
  id: 1,
  title: "HR Assistant",
  department: "Human Resources",
  industry: "general",
  seniorityLevel: "mid",
  avatarUrl: null,
  personalityDefaults: { warmth: 0.8 },
};

const MOCK_EMPLOYEE = {
  id: 1,
  orgId: 1,
  roleId: 1,
  name: "TestBot",
  department: "HR",
  team: null,
  status: "active",
  voiceId: null,
  voiceLanguage: "en",
  avatarUrl: "https://dicebear.com/TestBot",
  avatarConfig: {},
  personality: {},
  customInstructions: null,
  memoryContext: null,
  integrationPermissions: null,
  hiredAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function buildApp() {
  const employeesRouter = (await import("../routes/employees")).default;
  const app = express();
  app.use(express.json());
  app.use(employeesRouter);
  app.use(errorHandler);
  return app;
}

describe("POST /employees – voiceLanguage persistence", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
    mockSelectWhere.mockResolvedValue([MOCK_ROLE]);
  });

  it("persists explicit voiceLanguage when hiring an employee", async () => {
    const createdEmployee = { ...MOCK_EMPLOYEE, voiceLanguage: "es" };
    mockReturning.mockResolvedValue([createdEmployee]);
    mockSelectWhere.mockResolvedValue([MOCK_ROLE]);

    const res = await request(app)
      .post("/employees")
      .send({
        roleId: 1,
        name: "Spanish Bot",
        voiceLanguage: "es",
      });

    expect(res.status).toBe(201);
    expect(res.body.voiceLanguage).toBe("es");

    const insertedValues = (mockValues.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown> | undefined;
    expect(insertedValues!.voiceLanguage).toBe("es");
  });

  it("defaults voiceLanguage to 'en' when not provided during hire", async () => {
    const createdEmployee = { ...MOCK_EMPLOYEE, voiceLanguage: "en" };
    mockReturning.mockResolvedValue([createdEmployee]);
    mockSelectWhere.mockResolvedValue([MOCK_ROLE]);

    const res = await request(app)
      .post("/employees")
      .send({
        roleId: 1,
        name: "Default Lang Bot",
      });

    expect(res.status).toBe(201);
    expect(res.body.voiceLanguage).toBe("en");

    const insertedValues = (mockValues.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown> | undefined;
    expect(insertedValues!.voiceLanguage).toBe("en");
  });

  it("persists Japanese voiceLanguage during hire", async () => {
    const createdEmployee = { ...MOCK_EMPLOYEE, voiceLanguage: "ja" };
    mockReturning.mockResolvedValue([createdEmployee]);
    mockSelectWhere.mockResolvedValue([MOCK_ROLE]);

    const res = await request(app)
      .post("/employees")
      .send({
        roleId: 1,
        name: "Japanese Bot",
        voiceLanguage: "ja",
      });

    expect(res.status).toBe(201);
    expect(res.body.voiceLanguage).toBe("ja");

    const insertedValues = (mockValues.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown> | undefined;
    expect(insertedValues!.voiceLanguage).toBe("ja");
  });

  it("persists voiceId alongside voiceLanguage during hire", async () => {
    const createdEmployee = { ...MOCK_EMPLOYEE, voiceId: "custom-voice-1", voiceLanguage: "fr" };
    mockReturning.mockResolvedValue([createdEmployee]);
    mockSelectWhere.mockResolvedValue([MOCK_ROLE]);

    const res = await request(app)
      .post("/employees")
      .send({
        roleId: 1,
        name: "French Bot",
        voiceId: "custom-voice-1",
        voiceLanguage: "fr",
      });

    expect(res.status).toBe(201);
    expect(res.body.voiceId).toBe("custom-voice-1");
    expect(res.body.voiceLanguage).toBe("fr");

    const insertedValues = (mockValues.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown> | undefined;
    expect(insertedValues!.voiceId).toBe("custom-voice-1");
    expect(insertedValues!.voiceLanguage).toBe("fr");
  });

  it("rejects voiceLanguage exceeding max length", async () => {
    const res = await request(app)
      .post("/employees")
      .send({
        roleId: 1,
        name: "Long Lang Bot",
        voiceLanguage: "a".repeat(11),
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("PATCH /employees/:id – voiceLanguage persistence", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("updates voiceLanguage on an existing employee", async () => {
    const updatedEmployee = { ...MOCK_EMPLOYEE, voiceLanguage: "de" };
    mockSelectWhere.mockResolvedValueOnce([MOCK_EMPLOYEE]);
    mockReturning.mockResolvedValueOnce([updatedEmployee]);
    mockSelectWhere.mockResolvedValueOnce([MOCK_ROLE]);

    const res = await request(app)
      .patch("/employees/1")
      .send({ voiceLanguage: "de" });

    expect(res.status).toBe(200);
    expect(res.body.voiceLanguage).toBe("de");

    const setData = mockSet.mock.calls[0][0];
    expect(setData.voiceLanguage).toBe("de");
  });

  it("preserves other fields when updating only voiceLanguage", async () => {
    const updatedEmployee = { ...MOCK_EMPLOYEE, voiceLanguage: "pt" };
    mockSelectWhere.mockResolvedValueOnce([MOCK_EMPLOYEE]);
    mockReturning.mockResolvedValueOnce([updatedEmployee]);
    mockSelectWhere.mockResolvedValueOnce([MOCK_ROLE]);

    const res = await request(app)
      .patch("/employees/1")
      .send({ voiceLanguage: "pt" });

    expect(res.status).toBe(200);
    expect(res.body.voiceLanguage).toBe("pt");
    expect(res.body.name).toBe("TestBot");

    const setData = mockSet.mock.calls[0][0];
    expect(setData.voiceLanguage).toBe("pt");
    expect(setData.name).toBeUndefined();
  });

  it("updates voiceLanguage together with voiceId", async () => {
    const updatedEmployee = { ...MOCK_EMPLOYEE, voiceId: "cloned-voice-99", voiceLanguage: "zh" };
    mockSelectWhere.mockResolvedValueOnce([MOCK_EMPLOYEE]);
    mockReturning.mockResolvedValueOnce([updatedEmployee]);
    mockSelectWhere.mockResolvedValueOnce([MOCK_ROLE]);

    const res = await request(app)
      .patch("/employees/1")
      .send({ voiceId: "cloned-voice-99", voiceLanguage: "zh" });

    expect(res.status).toBe(200);
    expect(res.body.voiceId).toBe("cloned-voice-99");
    expect(res.body.voiceLanguage).toBe("zh");

    const setData = mockSet.mock.calls[0][0];
    expect(setData.voiceId).toBe("cloned-voice-99");
    expect(setData.voiceLanguage).toBe("zh");
  });

  it("does not modify voiceLanguage when it is not included in update", async () => {
    const updatedEmployee = { ...MOCK_EMPLOYEE, name: "Renamed Bot" };
    mockSelectWhere.mockResolvedValueOnce([MOCK_EMPLOYEE]);
    mockReturning.mockResolvedValueOnce([updatedEmployee]);
    mockSelectWhere.mockResolvedValueOnce([MOCK_ROLE]);

    const res = await request(app)
      .patch("/employees/1")
      .send({ name: "Renamed Bot" });

    expect(res.status).toBe(200);

    const setData = mockSet.mock.calls[0][0];
    expect(setData.voiceLanguage).toBeUndefined();
  });

  it("returns 404 when employee does not exist", async () => {
    mockSelectWhere.mockResolvedValueOnce([]);

    const res = await request(app)
      .patch("/employees/999")
      .send({ voiceLanguage: "fr" });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("rejects voiceLanguage exceeding max length on update", async () => {
    const res = await request(app)
      .patch("/employees/1")
      .send({ voiceLanguage: "toolongvalue" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});
