/**
 * Worker ESM entry point.
 * Pre-imports Node.js built-ins and provides a CJS-compatible require()
 * function so that CommonJS code (Express, etc.) can work at runtime.
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

// --- Timer polyfills: add .ref()/.unref() to timer IDs ---
const noop = () => {};

const origSetInterval = globalThis.setInterval;
const origSetTimeout = globalThis.setTimeout;

globalThis.setInterval = ((...args: any[]) => {
  const id = origSetInterval(...args as [any, any, ...any[]]);
  if (typeof id === "number" || typeof id === "object") {
    const timer = typeof id === "object" ? id : { [Symbol.toPrimitive]() { return id; } };
    if (!("unref" in timer)) (timer as any).unref = noop;
    if (!("ref" in timer)) (timer as any).ref = noop;
    if (!("hasRef" in timer)) (timer as any).hasRef = () => true;
    return timer as any;
  }
  return id;
}) as typeof setInterval;

globalThis.setTimeout = ((...args: any[]) => {
  const id = origSetTimeout(...args as [any, any, ...any[]]);
  if (typeof id === "number" || typeof id === "object") {
    const timer = typeof id === "object" ? id : { [Symbol.toPrimitive]() { return id; } };
    if (!("unref" in timer)) (timer as any).unref = noop;
    if (!("ref" in timer)) (timer as any).ref = noop;
    if (!("hasRef" in timer)) (timer as any).hasRef = () => true;
    return timer as any;
  }
  return id;
}) as typeof setTimeout;

// --- ESM → CJS conversion for require() ---
function toCjs(ns: any): any {
  if (ns && (typeof ns.default === "object" || typeof ns.default === "function") && ns.default != null) {
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
  console.warn(`require("${id}") — module not available in Workers, returning empty object`);
  return {};
}) as NodeRequire;

(globalThis.require as any).resolve = (id: string) => id;
(globalThis.require as any).cache = {};

// Re-export the Worker handler from the app bundle
export { default } from "./app-bundle.mjs";
