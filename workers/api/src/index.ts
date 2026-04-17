/**
 * NexusHR V4 API — Cloudflare Worker Entry Point
 *
 * Wraps the Express 5 application for the Workers runtime.
 * Uses nodejs_compat for full Node.js API support and
 * Hyperdrive for PostgreSQL connection pooling.
 */

// Set environment before any imports that read process.env
// This must happen before Express app or DB modules are loaded

export interface Env {
  HYPERDRIVE: { connectionString: string };
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  VITE_CLERK_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ELEVENLABS_API_KEY: string;
  HEYGEN_API_KEY: string;
  INTEGRATION_ENCRYPTION_KEY: string;
  OWNER_EMAILS: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  FRONTEND_URL: string;
}

function injectEnv(env: Env) {
  // Database — prefer Hyperdrive, fall back to raw DATABASE_URL
  if (env.HYPERDRIVE?.connectionString) {
    process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
  } else if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }

  // Auth
  if (env.CLERK_SECRET_KEY) process.env.CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
  if (env.CLERK_PUBLISHABLE_KEY) process.env.CLERK_PUBLISHABLE_KEY = env.CLERK_PUBLISHABLE_KEY;
  if (env.VITE_CLERK_PUBLISHABLE_KEY) process.env.VITE_CLERK_PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

  // Payments
  if (env.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
  if (env.STRIPE_WEBHOOK_SECRET) process.env.STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
  if (env.PAYPAL_CLIENT_ID) process.env.PAYPAL_CLIENT_ID = env.PAYPAL_CLIENT_ID;
  if (env.PAYPAL_CLIENT_SECRET) process.env.PAYPAL_CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;

  // Integrations
  if (env.ELEVENLABS_API_KEY) process.env.ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;
  if (env.HEYGEN_API_KEY) process.env.HEYGEN_API_KEY = env.HEYGEN_API_KEY;
  if (env.INTEGRATION_ENCRYPTION_KEY) process.env.INTEGRATION_ENCRYPTION_KEY = env.INTEGRATION_ENCRYPTION_KEY;

  // App config
  if (env.OWNER_EMAILS) process.env.OWNER_EMAILS = env.OWNER_EMAILS;
  if (env.FRONTEND_URL) process.env.FRONTEND_URL = env.FRONTEND_URL;

  // Workers environment
  process.env.NODE_ENV = "production";
  process.env.PORT = "8787";

  // Disable features not compatible with Workers
  process.env.DISABLE_WEBSOCKET = "true";
  process.env.DISABLE_SCHEDULERS = "true";
}

// Lazy-load the Express app after env is set
let appPromise: Promise<any> | null = null;

function getApp(env: Env) {
  if (!appPromise) {
    injectEnv(env);
    appPromise = import("./app-loader").then(m => m.default);
  }
  return appPromise;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Inject env vars on every request (Hyperdrive connection string changes)
    injectEnv(env);

    try {
      const app = await getApp(env);

      // Use Express 5's native fetch compatibility
      // Express 5 apps can handle Web API Request objects
      const response = await new Promise<Response>((resolve, reject) => {
        // Convert Web API Request to Node.js-compatible IncomingMessage
        const url = new URL(request.url);

        // Create a minimal Node.js-style request/response
        const { createServer } = require("http");
        const { Readable } = require("stream");

        // Build headers object
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        // Create a mock IncomingMessage
        const body = request.body ? Readable.fromWeb(request.body) : Readable.from([]);

        const req = Object.assign(body, {
          method: request.method,
          url: url.pathname + url.search,
          headers,
          connection: { remoteAddress: headers["cf-connecting-ip"] || "127.0.0.1" },
          socket: { remoteAddress: headers["cf-connecting-ip"] || "127.0.0.1" },
        });

        // Create a mock ServerResponse that captures the output
        const { ServerResponse } = require("http");
        const res = new ServerResponse(req);

        const chunks: Buffer[] = [];
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);

        res.write = (chunk: any, ...args: any[]) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return originalWrite(chunk, ...args);
        };

        res.end = (chunk: any, ...args: any[]) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));

          const responseHeaders = new Headers();
          const rawHeaders = res.getHeaders();
          for (const [key, value] of Object.entries(rawHeaders)) {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                value.forEach((v: string) => responseHeaders.append(key, v));
              } else {
                responseHeaders.set(key, String(value));
              }
            }
          }

          resolve(new Response(
            chunks.length > 0 ? Buffer.concat(chunks) : null,
            {
              status: res.statusCode,
              statusText: res.statusMessage || "",
              headers: responseHeaders,
            }
          ));

          return originalEnd(chunk, ...args);
        };

        // Let Express handle the request
        app(req, res);
      });

      return response;
    } catch (error: any) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error", message: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
} satisfies ExportedHandler<Env>;
