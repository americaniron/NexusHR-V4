/**
 * Noop stub for modules not compatible with Cloudflare Workers.
 * Provides safe fallbacks for common APIs used by Express/Node deps.
 */
export default {};

// tty compatibility
export const isatty = () => false;
export const ReadStream = class ReadStream {};
export const WriteStream = class WriteStream {};

// child_process compatibility
export const exec = () => { throw new Error("child_process not available in Workers"); };
export const execSync = exec;
export const spawn = exec;
export const fork = exec;

// cluster compatibility
export const isMaster = true;
export const isPrimary = true;
export const isWorker = false;

// dgram compatibility
export const createSocket = () => { throw new Error("dgram not available in Workers"); };

// Generic stubs
export const Storage = class Storage {
  constructor() { throw new Error("Not available in Cloudflare Workers"); }
};
export const Bucket = class Bucket {};
