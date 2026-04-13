import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface ComponentHealth {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs?: number;
  message?: string;
}

router.get("/healthz", async (_req, res) => {
  const components: Record<string, ComponentHealth> = {};
  let overallStatus: "ok" | "degraded" | "unhealthy" = "ok";

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    components.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (err) {
    components.database = { status: "unhealthy", latencyMs: Date.now() - dbStart, message: "Database connection failed" };
    overallStatus = "unhealthy";
    logger.error({ err }, "Health check: database connection failed");
  }

  components.api = { status: "healthy" };

  const clerkConfigured = !!(process.env.CLERK_SECRET_KEY || process.env.CLERK_PUBLISHABLE_KEY);
  components.auth = clerkConfigured
    ? { status: "healthy", message: "Clerk configured" }
    : { status: "degraded", message: "Clerk keys not configured" };
  if (!clerkConfigured && overallStatus === "ok") overallStatus = "degraded";

  const elevenlabsConfigured = !!process.env.ELEVENLABS_API_KEY;
  components.voice = elevenlabsConfigured
    ? { status: "healthy", message: "ElevenLabs configured" }
    : { status: "degraded", message: "ElevenLabs API key not set" };

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  components.payments = stripeConfigured
    ? { status: "healthy", message: "Stripe configured" }
    : { status: "degraded", message: "Stripe key not set" };

  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "0.0.0",
    components,
  });
});

export default router;
