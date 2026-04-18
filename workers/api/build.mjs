import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, writeFile } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const workerDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(workerDir, "../..");

// Node.js built-in modules NOT available in Cloudflare Workers
const UNSUPPORTED_NODE_BUILTINS = [
  "tty",
  "child_process",
  "cluster",
  "dgram",
  "readline",
  "repl",
  "vm",
  "v8",
  "inspector",
  "trace_events",
  "worker_threads",
];

async function buildWorker() {
  const distDir = path.resolve(workerDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const noopStub = path.resolve(workerDir, "src/stubs/noop-module.ts");

  const nodeStubPlugin = {
    name: "node-stub",
    setup(build) {
      for (const mod of UNSUPPORTED_NODE_BUILTINS) {
        const filter = new RegExp(`^(node:)?${mod}$`);
        build.onResolve({ filter }, () => ({
          path: noopStub,
        }));
      }
    },
  };

  // Build the main app bundle (ESM format)
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
    plugins: [nodeStubPlugin],
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
      "protobufjs",
      "onnxruntime-node",
      "@swc/*",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "classic-level",
      "dd-trace",
      "newrelic",
      "piscina",
      "tinypool",
    ],
    sourcemap: "linked",
    define: {
      "process.env.DISABLE_WEBSOCKET": '"true"',
      "process.env.DISABLE_SCHEDULERS": '"true"',
    },
    alias: {
      "@workspace/db/schema": path.resolve(rootDir, "lib/db/src/schema"),
      "@workspace/db": path.resolve(rootDir, "lib/db/src/index.ts"),
      "@workspace/api-zod": path.resolve(rootDir, "lib/api-zod/src/index.ts"),
      "socket.io": path.resolve(workerDir, "src/stubs/socket.io.ts"),
      "socket.io-client": path.resolve(workerDir, "src/stubs/socket.io.ts"),
      "@xenova/transformers": path.resolve(workerDir, "src/stubs/xenova-transformers.ts"),
      "@google-cloud/storage": noopStub,
      "@google-cloud/pubsub": noopStub,
      "@google-cloud/logging": noopStub,
      "googleapis": noopStub,
      "firebase-admin": noopStub,
      "@aws-sdk/client-s3": noopStub,
      "@aws-sdk/client-ses": noopStub,
      "@aws-sdk/client-sqs": noopStub,
      "aws-sdk": noopStub,
      "@azure/storage-blob": noopStub,
      "@azure/identity": noopStub,
      "nodemailer": noopStub,
      "handlebars": noopStub,
      "knex": noopStub,
      "typeorm": noopStub,
      "@prisma/client": noopStub,
      "@mikro-orm/core": noopStub,
      "@grpc/grpc-js": noopStub,
      "@grpc/proto-loader": noopStub,
      "@opentelemetry/api": noopStub,
      "@opentelemetry/sdk-node": noopStub,
      "@tensorflow/tfjs-node": noopStub,
    },
    // No banner — the wrapper entry handles require()
  });

  // Rename dist/index.mjs to dist/app-bundle.mjs
  const { rename } = await import("node:fs/promises");
  await rename(
    path.resolve(distDir, "index.mjs"),
    path.resolve(distDir, "app-bundle.mjs"),
  );
  // Also rename source map if present
  try {
    await rename(
      path.resolve(distDir, "index.mjs.map"),
      path.resolve(distDir, "app-bundle.mjs.map"),
    );
  } catch (e) {}

  // Build the ESM wrapper entry that provides require()
  await esbuild({
    entryPoints: [path.resolve(workerDir, "src/worker-entry.ts")],
    platform: "node",
    target: "esnext",
    bundle: false, // Don't bundle — just compile TS to JS
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
  });

  // Rename worker-entry.mjs to index.mjs
  await rename(
    path.resolve(distDir, "worker-entry.mjs"),
    path.resolve(distDir, "index.mjs"),
  );

  console.log("Worker build complete → workers/api/dist/");
}

buildWorker().catch((err) => {
  console.error("Worker build failed:", err);
  process.exit(1);
});
