import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { validate, paginationQuery } from "../middlewares/validate";
import { errorHandler } from "../middlewares/errorHandler";
import { listRolesQuery, listTasksQuery } from "../schemas/query";

const stubHandler: express.RequestHandler = (_req, res) => {
  res.json({
    data: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  });
};

function buildRolesApp() {
  const app = express();
  app.get("/api/roles", validate({ query: listRolesQuery }), stubHandler);
  app.use(errorHandler);
  return app;
}

function buildTasksApp() {
  const app = express();
  app.get("/api/tasks", validate({ query: listTasksQuery }), stubHandler);
  app.use(errorHandler);
  return app;
}

function buildWorkflowsApp() {
  const app = express();
  app.get("/api/workflows", validate({ query: paginationQuery }), stubHandler);
  app.use(errorHandler);
  return app;
}

describe("GET /api/roles – query parameter validation", () => {
  const app = buildRolesApp();

  it("returns 200 with valid known params", async () => {
    const res = await request(app)
      .get("/api/roles?page=1&limit=10&category=engineering&sortBy=newest");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });

  it("returns 200 with unknown proxy query params (passthrough)", async () => {
    const res = await request(app)
      .get("/api/roles?page=1&__token=abc123&_rsc=xyz&proxyId=p1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("returns 200 with only unknown params (no known params)", async () => {
    const res = await request(app)
      .get("/api/roles?__proxy_token=abc&_nonce=123");

    expect(res.status).toBe(200);
  });

  it("returns 200 with no query params at all", async () => {
    const res = await request(app).get("/api/roles");
    expect(res.status).toBe(200);
  });

  it("returns 400 for limit=999 (exceeds max of 50)", async () => {
    const res = await request(app).get("/api/roles?limit=999");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("limit") }),
      ]),
    );
  });

  it("returns 400 for page=0 (below min of 1)", async () => {
    const res = await request(app).get("/api/roles?page=0");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for page=-1", async () => {
    const res = await request(app).get("/api/roles?page=-1");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for limit=0", async () => {
    const res = await request(app).get("/api/roles?limit=0");
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid sortBy enum value", async () => {
    const res = await request(app).get("/api/roles?sortBy=invalid_sort");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("sortBy") }),
      ]),
    );
  });

  it("returns 400 for invalid known params even with unknown params present", async () => {
    const res = await request(app)
      .get("/api/roles?limit=999&__proxy_token=abc");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/tasks – query parameter validation", () => {
  const app = buildTasksApp();

  it("returns 200 with valid params and unknown proxy params", async () => {
    const res = await request(app)
      .get("/api/tasks?page=1&limit=10&status=pending&__token=secret");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });

  it("returns 200 with valid status and priority", async () => {
    const res = await request(app)
      .get("/api/tasks?status=completed&priority=high");

    expect(res.status).toBe(200);
  });

  it("returns 200 with only unknown params", async () => {
    const res = await request(app)
      .get("/api/tasks?__replit_proxy=abc&_debug=true");

    expect(res.status).toBe(200);
  });

  it("returns 200 with assigneeId coerced as number", async () => {
    const res = await request(app).get("/api/tasks?assigneeId=42");
    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid status enum value", async () => {
    const res = await request(app).get("/api/tasks?status=unknown_status");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("status") }),
      ]),
    );
  });

  it("returns 400 for invalid priority enum value", async () => {
    const res = await request(app).get("/api/tasks?priority=urgent");

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: expect.stringContaining("priority"),
        }),
      ]),
    );
  });

  it("returns 400 for limit exceeding max", async () => {
    const res = await request(app).get("/api/tasks?limit=100");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 for invalid known params even with unknown params", async () => {
    const res = await request(app)
      .get("/api/tasks?status=bogus&__proxy=xyz");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});

describe("GET /api/workflows – query parameter validation", () => {
  const app = buildWorkflowsApp();

  it("returns 200 with valid pagination params", async () => {
    const res = await request(app).get("/api/workflows?page=1&limit=25");
    expect(res.status).toBe(200);
  });

  it("returns 200 with unknown proxy params (passthrough)", async () => {
    const res = await request(app)
      .get("/api/workflows?page=1&__replit_token=abc&_proxy=true");

    expect(res.status).toBe(200);
  });

  it("returns 200 with only unknown params", async () => {
    const res = await request(app)
      .get("/api/workflows?randomParam=value&anotherUnknown=123");

    expect(res.status).toBe(200);
  });

  it("returns 200 for limit=50 (boundary)", async () => {
    const res = await request(app).get("/api/workflows?limit=50");
    expect(res.status).toBe(200);
  });

  it("returns 200 for limit=1 (boundary)", async () => {
    const res = await request(app).get("/api/workflows?limit=1");
    expect(res.status).toBe(200);
  });

  it("returns 400 for limit=51 (exceeds max)", async () => {
    const res = await request(app).get("/api/workflows?limit=51");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for non-integer page value", async () => {
    const res = await request(app).get("/api/workflows?page=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 for invalid limit even with unknown params", async () => {
    const res = await request(app)
      .get("/api/workflows?limit=999&__token=xyz");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
