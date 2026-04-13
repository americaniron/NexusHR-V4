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

async function probeClerk(): Promise<ComponentHealth> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return { status: "degraded", message: "Clerk keys not configured" };
  }
  const start = Date.now();
  try {
    const resp = await fetch("https://api.clerk.com/v1/clients", {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(3000),
    });
    const latencyMs = Date.now() - start;
    if (resp.status === 401) {
      return { status: "degraded", latencyMs, message: "Clerk key invalid" };
    }
    return { status: "healthy", latencyMs, message: "Clerk reachable" };
  } catch {
    return { status: "degraded", latencyMs: Date.now() - start, message: "Clerk unreachable" };
  }
}

async function probeDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (err) {
    logger.error({ err }, "Health check: database connection failed");
    return { status: "unhealthy", latencyMs: Date.now() - start, message: "Database connection failed" };
  }
}

function checkStripe(): ComponentHealth {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { status: "degraded", message: "Stripe key not set" };
  }
  return { status: "healthy", message: "Stripe configured" };
}

function checkVoice(): ComponentHealth {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return { status: "degraded", message: "ElevenLabs API key not set" };
  }
  return { status: "healthy", message: "ElevenLabs configured" };
}

router.get("/healthz", async (_req, res) => {
  const [dbHealth, authHealth] = await Promise.all([
    probeDatabase(),
    probeClerk(),
  ]);

  const components: Record<string, ComponentHealth> = {
    database: dbHealth,
    api: { status: "healthy" },
    auth: authHealth,
    voice: checkVoice(),
    payments: checkStripe(),
  };

  let overallStatus: "ok" | "degraded" | "unhealthy" = "ok";
  for (const comp of Object.values(components)) {
    if (comp.status === "unhealthy") {
      overallStatus = "unhealthy";
      break;
    }
    if (comp.status === "degraded" && overallStatus === "ok") {
      overallStatus = "degraded";
    }
  }

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
