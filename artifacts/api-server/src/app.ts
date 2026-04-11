import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const allowedOrigins = [
  `https://${process.env.REPLIT_DEV_DOMAIN}`,
  `https://${process.env.REPLIT_DEPLOYMENT_URL}`,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

if (process.env.NODE_ENV === "production" && !process.env.REPLIT_DEV_DOMAIN && !process.env.REPLIT_DEPLOYMENT_URL) {
  console.warn("[CORS] No REPLIT_DEV_DOMAIN or REPLIT_DEPLOYMENT_URL set — CORS will reject all cross-origin requests in production");
}

const allowedHosts = new Set(
  allowedOrigins.map(u => { try { return new URL(u).host; } catch { return null; } }).filter(Boolean)
);

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    try {
      const originHost = new URL(origin).host;
      if (allowedHosts.has(originHost)) {
        callback(null, true);
        return;
      }
    } catch {}
    if (process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

app.use((req, res, next) => {
  if (req.path === "/api/voice/transcribe") {
    return next();
  }
  express.json({ limit: "1mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
