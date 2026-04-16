import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = "enc:v1:";

function getEncryptionKey(): Buffer {
  const keyHex = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY environment variable is not set");
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return key;
}

export function encryptConnectionConfig(config: unknown): string {
  if (config === null || config === undefined) {
    return JSON.stringify(config);
  }
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const plaintext = JSON.stringify(config);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64");
  return ENCRYPTED_PREFIX + payload;
}

export function decryptConnectionConfig(stored: unknown): unknown {
  if (stored === null || stored === undefined) {
    return stored;
  }

  if (typeof stored === "object") {
    return stored;
  }

  if (typeof stored !== "string") {
    return stored;
  }

  if (!stored.startsWith(ENCRYPTED_PREFIX)) {
    return stored;
  }

  const key = getEncryptionKey();
  const payload = Buffer.from(stored.slice(ENCRYPTED_PREFIX.length), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

export function isEncrypted(stored: unknown): boolean {
  return typeof stored === "string" && stored.startsWith(ENCRYPTED_PREFIX);
}
