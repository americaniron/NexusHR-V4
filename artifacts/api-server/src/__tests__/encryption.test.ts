import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { encryptConnectionConfig, decryptConnectionConfig, isEncrypted } from "../lib/encryption";

const TEST_KEY = "a".repeat(64);

describe("encryption", () => {
  const originalKey = process.env.INTEGRATION_ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = TEST_KEY;
  });

  afterAll(() => {
    if (originalKey !== undefined) {
      process.env.INTEGRATION_ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.INTEGRATION_ENCRYPTION_KEY;
    }
  });

  it("encrypts and decrypts a config object", () => {
    const config = {
      accessToken: "xoxb-real-token",
      refreshToken: "xoxr-refresh",
      tokenType: "Bearer",
      expiresAt: 1700000000000,
      scope: "channels:read,chat:write",
    };

    const encrypted = encryptConnectionConfig(config);
    expect(typeof encrypted).toBe("string");
    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain("xoxb-real-token");

    const decrypted = decryptConnectionConfig(encrypted);
    expect(decrypted).toEqual(config);
  });

  it("returns null/undefined unchanged", () => {
    expect(decryptConnectionConfig(null)).toBeNull();
    expect(decryptConnectionConfig(undefined)).toBeUndefined();
  });

  it("handles plaintext objects gracefully on decrypt", () => {
    const plainObj = { accessToken: "test" };
    expect(decryptConnectionConfig(plainObj)).toEqual(plainObj);
  });

  it("isEncrypted detects encrypted strings", () => {
    const config = { accessToken: "test-token" };
    const encrypted = encryptConnectionConfig(config);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted(config)).toBe(false);
    expect(isEncrypted(null)).toBe(false);
    expect(isEncrypted("random-string")).toBe(false);
  });

  it("produces different ciphertexts for same input (random IV)", () => {
    const config = { accessToken: "test-token" };
    const encrypted1 = encryptConnectionConfig(config);
    const encrypted2 = encryptConnectionConfig(config);
    expect(encrypted1).not.toBe(encrypted2);

    expect(decryptConnectionConfig(encrypted1)).toEqual(config);
    expect(decryptConnectionConfig(encrypted2)).toEqual(config);
  });

  it("throws when key is missing", () => {
    const savedKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    delete process.env.INTEGRATION_ENCRYPTION_KEY;
    expect(() => encryptConnectionConfig({ test: true })).toThrow("INTEGRATION_ENCRYPTION_KEY");
    process.env.INTEGRATION_ENCRYPTION_KEY = savedKey;
  });

  it("throws when key is wrong length", () => {
    const savedKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    process.env.INTEGRATION_ENCRYPTION_KEY = "abcd";
    expect(() => encryptConnectionConfig({ test: true })).toThrow("64-character hex string");
    process.env.INTEGRATION_ENCRYPTION_KEY = savedKey;
  });
});
