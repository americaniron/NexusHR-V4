import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import { rateLimit } from "./middlewares/rateLimit";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    genReqId: () => randomUUID(),
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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://clerk.nexsushr.com", "https://*.clerk.accounts.dev"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "https://*.clerk.com", "https://img.clerk.com"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https://*.clerk.accounts.dev"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,
  xFrameOptions: { action: "deny" },
}));

app.use(compression());

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

const globalLimiter = rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "global" });
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/api/billing/webhook") {
    return next();
  }
  globalLimiter(req, res, next);
});

app.use((req, res, next) => {
  if (req.path === "/api/voice/transcribe" || req.path === "/api/billing/webhook") {
    return next();
  }
  express.json({ limit: "1mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

const PUBLIC_PATH_PREFIXES = ["/healthz", "/billing/webhook", "/roles", "/static"];

app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  if (PUBLIC_PATH_PREFIXES.some(p => path === p || path.startsWith(p + "/"))) {
    return next();
  }
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
});

app.use("/api/static", express.static("public", {
  maxAge: "7d",
  immutable: true,
  etag: true,
  lastModified: true,
}));

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
