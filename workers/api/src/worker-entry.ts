/**
 * Worker ESM entry point.
 * Pre-imports Node.js built-ins and provides a CJS-compatible require()
 * function so that CommonJS code (Express, etc.) can work at runtime.
 *
 * Key: ESM namespace objects have shape { default, namedExport1, ... }
 * but CJS require() should return the default export directly for
 * modules that have one (e.g., require('events') === EventEmitter).
 */
import * as _events from "node:events";
import * as _fs from "node:fs";
import * as _fsp from "node:fs/promises";
import * as _path from "node:path";
import * as _url from "node:url";
import * as _http from "node:http";
import * as _https from "node:https";
import * as _crypto from "node:crypto";
import * as _stream from "node:stream";
import * as _buffer from "node:buffer";
import * as _util from "node:util";
import * as _os from "node:os";
import * as _zlib from "node:zlib";
import * as _querystring from "node:querystring";
import * as _net from "node:net";
import * as _tls from "node:tls";
import * as _assert from "node:assert";
import * as _string_decoder from "node:string_decoder";
import * as _async_hooks from "node:async_hooks";
import * as _diagnostics_channel from "node:diagnostics_channel";
import * as _module from "node:module";
import * as _perf_hooks from "node:perf_hooks";

// Convert ESM namespace to CJS-style export:
// If the namespace has a "default" that's an object/function, use it as the base
// and merge named exports onto it (mimicking how Node.js CJS interop works)
function toCjs(ns: any): any {
  if (ns && ns.default != null && typeof ns.default === "object" || typeof ns.default === "function") {
    // Merge named exports onto default, but don't override existing properties
    const merged = ns.default;
    for (const key of Object.keys(ns)) {
      if (key !== "default" && !(key in merged)) {
        try { merged[key] = ns[key]; } catch (e) {}
      }
    }
    return merged;
  }
  return ns;
}

const builtinModules: Record<string, any> = {};

// Register all builtins with both bare and node: prefixed names
const raw: Record<string, any> = {
  "events": _events, "fs": _fs, "fs/promises": _fsp,
  "path": _path, "url": _url, "http": _http, "https": _https,
  "crypto": _crypto, "stream": _stream, "buffer": _buffer,
  "util": _util, "os": _os, "zlib": _zlib,
  "querystring": _querystring, "net": _net, "tls": _tls,
  "assert": _assert, "string_decoder": _string_decoder,
  "async_hooks": _async_hooks, "diagnostics_channel": _diagnostics_channel,
  "module": _module, "perf_hooks": _perf_hooks,
};

for (const [name, ns] of Object.entries(raw)) {
  const cjs = toCjs(ns);
  builtinModules[name] = cjs;
  builtinModules[`node:${name}`] = cjs;
}

// Provide CJS-compatible require() for runtime use
globalThis.require = ((id: string) => {
  if (builtinModules[id]) return builtinModules[id];
  // Return empty object for unknown modules (better than crashing)
  console.warn(`require("${id}") — module not available in Workers, returning empty object`);
  return {};
}) as NodeRequire;

// Also provide require.resolve as a no-op
(globalThis.require as any).resolve = (id: string) => id;
(globalThis.require as any).cache = {};

// Re-export the Worker handler from the app bundle
export { default } from "./app-bundle.mjs";
