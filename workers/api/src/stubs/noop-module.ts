/**
 * Noop stub for modules not compatible with Cloudflare Workers.
 * This file replaces heavy/native dependencies that can't run in Workers.
 */
export default {};
export const Storage = class Storage {
  constructor() {
    throw new Error("@google-cloud/storage is not available in Cloudflare Workers");
  }
};
export const Bucket = class Bucket {};
