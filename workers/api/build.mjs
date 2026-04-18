import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const workerDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(workerDir, "../..");

async function buildWorker() {
  const distDir = path.resolve(workerDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(workerDir, "src/index.ts")],
    platform: "node",
    target: "esnext",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    conditions: ["workerd", "worker", "browser"],
    // Externalize packages that won't work in Workers
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@xenova/transformers",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "newrelic",
      "piscina",
      "tinypool",
      // socket.io and @xenova/transformers are handled via alias stubs
    ],
    sourcemap: "linked",
    define: {
      "process.env.DISABLE_WEBSOCKET": '"true"',
      "process.env.DISABLE_SCHEDULERS": '"true"',
    },
    // Resolve workspace packages and provide stubs for incompatible deps
    alias: {
      "@workspace/db/schema": path.resolve(rootDir, "lib/db/src/schema"),
      "@workspace/db": path.resolve(rootDir, "lib/db/src/index.ts"),
      "@workspace/api-zod": path.resolve(rootDir, "lib/api-zod/src/index.ts"),
      "socket.io": path.resolve(workerDir, "src/stubs/socket.io.ts"),
      "socket.io-client": path.resolve(workerDir, "src/stubs/socket.io.ts"),
      "@xenova/transformers": path.resolve(workerDir, "src/stubs/xenova-transformers.ts"),
    },
    // CJS compat banner for Express and other CJS packages
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });

  console.log("Worker build complete → workers/api/dist/");
}

buildWorker().catch((err) => {
  console.error("Worker build failed:", err);
  process.exit(1);
});
