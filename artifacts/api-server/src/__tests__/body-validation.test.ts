import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { errorHandler } from "../middlewares/errorHandler";

const createTaskBody = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigneeId: z.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateTaskBody = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  assigneeId: z.number().int().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  deliverable: z.string().optional(),
});

const createWorkflowBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  triggerType: z.string().optional(),
});

const updateWorkflowBody = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
});

const stubHandler: express.RequestHandler = (req, res) => {
  res.status(201).json({ ok: true, body: req.body });
};

const stubPatchHandler: express.RequestHandler = (req, res) => {
  res.json({ ok: true, body: req.body });
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post("/api/tasks", validate({ body: createTaskBody }), stubHandler);
  app.patch("/api/tasks/:id", validate({ body: updateTaskBody }), stubPatchHandler);
  app.post("/api/workflows", validate({ body: createWorkflowBody }), stubHandler);
  app.patch("/api/workflows/:id", validate({ body: updateWorkflowBody }), stubPatchHandler);
  app.use(errorHandler);
  return app;
}

describe("POST /api/tasks – body validation", () => {
  const app = buildApp();

  it("returns 201 with a valid body", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Fix the login bug" });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.body.title).toBe("Fix the login bug");
    expect(res.body.body.priority).toBe("medium");
  });

  it("returns 201 with all optional fields provided", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({
        title: "Deploy update",
        description: "Push the new release",
        assigneeId: 5,
        priority: "high",
        category: "engineering",
        dueDate: "2026-05-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.body.priority).toBe("high");
    expect(res.body.body.assigneeId).toBe(5);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ description: "No title provided" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("title") }),
      ]),
    );
  });

  it("returns 400 when title is empty string", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when title exceeds max length", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "x".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when priority has an invalid enum value", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Valid title", priority: "urgent" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("priority") }),
      ]),
    );
  });

  it("returns 400 when assigneeId is not an integer", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Valid title", assigneeId: 3.14 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when assigneeId is a string", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Valid title", assigneeId: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("applies default priority when not provided", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Use default priority" });

    expect(res.status).toBe(201);
    expect(res.body.body.priority).toBe("medium");
  });

  it("returns 400 for empty body", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("PATCH /api/tasks/:id – body validation", () => {
  const app = buildApp();

  it("returns 200 with a valid partial update", async () => {
    const res = await request(app)
      .patch("/api/tasks/1")
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.body.status).toBe("completed");
  });

  it("returns 200 with an empty body (all fields optional)", async () => {
    const res = await request(app)
      .patch("/api/tasks/1")
      .send({});

    expect(res.status).toBe(200);
  });

  it("returns 200 with nullable assigneeId set to null", async () => {
    const res = await request(app)
      .patch("/api/tasks/1")
      .send({ assigneeId: null });

    expect(res.status).toBe(200);
    expect(res.body.body.assigneeId).toBeNull();
  });

  it("returns 400 for invalid status enum value", async () => {
    const res = await request(app)
      .patch("/api/tasks/1")
      .send({ status: "done" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("status") }),
      ]),
    );
  });

  it("returns 400 for invalid priority enum value", async () => {
    const res = await request(app)
      .patch("/api/tasks/1")
      .send({ priority: "extreme" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/workflows – body validation", () => {
  const app = buildApp();

  it("returns 201 with a valid body", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({ name: "Onboarding pipeline" });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.body.name).toBe("Onboarding pipeline");
  });

  it("returns 201 with all optional fields", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({
        name: "Data sync",
        description: "Nightly data synchronization",
        triggerType: "scheduled",
      });

    expect(res.status).toBe(201);
    expect(res.body.body.triggerType).toBe("scheduled");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({ description: "No name" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("name") }),
      ]),
    );
  });

  it("returns 400 when name is empty string", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when name exceeds max length", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({ name: "x".repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for empty body", async () => {
    const res = await request(app)
      .post("/api/workflows")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("PATCH /api/workflows/:id – body validation", () => {
  const app = buildApp();

  it("returns 200 with a valid partial update", async () => {
    const res = await request(app)
      .patch("/api/workflows/1")
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.body.status).toBe("active");
  });

  it("returns 200 with an empty body (all fields optional)", async () => {
    const res = await request(app)
      .patch("/api/workflows/1")
      .send({});

    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid status enum value", async () => {
    const res = await request(app)
      .patch("/api/workflows/1")
      .send({ status: "deleted" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: expect.stringContaining("status") }),
      ]),
    );
  });

  it("returns 400 when name exceeds max length", async () => {
    const res = await request(app)
      .patch("/api/workflows/1")
      .send({ name: "y".repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});
