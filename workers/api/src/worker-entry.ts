/**
 * Worker ESM entry point.
 * Pre-imports Node.js built-ins and provides a require() function
 * so that CJS code (Express, etc.) can use require() at runtime.
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

const builtinModules: Record<string, any> = {
  "events": _events, "node:events": _events,
  "fs": _fs, "node:fs": _fs,
  "fs/promises": _fsp, "node:fs/promises": _fsp,
  "path": _path, "node:path": _path,
  "url": _url, "node:url": _url,
  "http": _http, "node:http": _http,
  "https": _https, "node:https": _https,
  "crypto": _crypto, "node:crypto": _crypto,
  "stream": _stream, "node:stream": _stream,
  "buffer": _buffer, "node:buffer": _buffer,
  "util": _util, "node:util": _util,
  "os": _os, "node:os": _os,
  "zlib": _zlib, "node:zlib": _zlib,
  "querystring": _querystring, "node:querystring": _querystring,
  "net": _net, "node:net": _net,
  "tls": _tls, "node:tls": _tls,
  "assert": _assert, "node:assert": _assert,
  "string_decoder": _string_decoder, "node:string_decoder": _string_decoder,
  "async_hooks": _async_hooks, "node:async_hooks": _async_hooks,
  "diagnostics_channel": _diagnostics_channel, "node:diagnostics_channel": _diagnostics_channel,
  "module": _module, "node:module": _module,
};

// Provide require() for CJS code (Express, etc.) running in ESM context
globalThis.require = ((id: string) => {
  if (builtinModules[id]) return builtinModules[id];
  throw new Error(`require() cannot resolve "${id}" in Workers runtime`);
}) as NodeRequire;

// Re-export the Worker handler from the app bundle
export { default } from "./app-bundle.mjs";
