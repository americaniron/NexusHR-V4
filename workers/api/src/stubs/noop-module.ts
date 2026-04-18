/**
 * Noop stub for modules not compatible with Cloudflare Workers.
 * Provides safe, non-throwing fallbacks so the app can initialize.
 * Actual operations will fail gracefully at call sites, not at import/construct time.
 */
export default {};

// tty compatibility
export const isatty = () => false;
export const ReadStream = class ReadStream {};
export const WriteStream = class WriteStream {};

// child_process compatibility
export const exec = (...args: any[]) => {
  const cb = args[args.length - 1];
  if (typeof cb === "function") cb(new Error("child_process not available"), "", "");
};
export const execSync = () => "";
export const spawn = () => ({ on: () => {}, stdout: { on: () => {} }, stderr: { on: () => {} }, kill: () => {} });
export const fork = spawn;
export const execFile = exec;

// cluster compatibility
export const isMaster = true;
export const isPrimary = true;
export const isWorker = false;

// dgram compatibility
export const createSocket = () => ({ on: () => {}, send: () => {}, close: () => {} });

// Google Cloud Storage compatibility — non-throwing constructors
export class Storage {
  constructor(..._args: any[]) {}
  bucket(_name: string) {
    return new Bucket();
  }
}

export class Bucket {
  file(_name: string) { return new File(); }
  upload() { return Promise.reject(new Error("GCS not available in Workers")); }
  getFiles() { return Promise.resolve([[]]); }
}

export class File {
  createWriteStream() { return { on: () => {}, end: () => {}, write: () => {} }; }
  createReadStream() { return { on: () => {}, pipe: () => ({}) }; }
  save() { return Promise.reject(new Error("GCS not available in Workers")); }
  download() { return Promise.reject(new Error("GCS not available in Workers")); }
  delete() { return Promise.resolve(); }
  exists() { return Promise.resolve([false]); }
  getSignedUrl() { return Promise.resolve([""]); }
}

// Generic transport/mailer stubs
export const createTransport = () => ({
  sendMail: () => Promise.reject(new Error("nodemailer not available in Workers")),
  verify: () => Promise.resolve(true),
});

// Handlebars stubs
export const compile = (template: string) => (data: any) => template;
export const registerHelper = () => {};
export const registerPartial = () => {};
