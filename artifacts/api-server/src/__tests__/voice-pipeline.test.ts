import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("@clerk/express", () => ({
  getAuth: () => ({ userId: "test-user-123", sessionClaims: { userId: "test-user-123" } }),
}));

const mockTextToSpeechStream = vi.fn();
const mockTextToSpeechWithAlignment = vi.fn();
const mockCloneVoice = vi.fn();

vi.mock("../lib/elevenlabs", () => ({
  textToSpeechStream: (...args: unknown[]) => mockTextToSpeechStream(...args),
  textToSpeechWithAlignment: (...args: unknown[]) => mockTextToSpeechWithAlignment(...args),
  cloneVoice: (...args: unknown[]) => mockCloneVoice(...args),
  SUPPORTED_LANGUAGES: [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ],
}));

const mockSpeechToText = vi.fn();
const mockEnsureCompatibleFormat = vi.fn();

vi.mock("@workspace/integrations-openai-ai-server/audio", () => ({
  speechToText: (...args: unknown[]) => mockSpeechToText(...args),
  ensureCompatibleFormat: (...args: unknown[]) => mockEnsureCompatibleFormat(...args),
}));

vi.mock("../middlewares/rateLimit", () => ({
  rateLimit: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { errorHandler } from "../middlewares/errorHandler";

async function buildApp() {
  const voiceRouter = (await import("../routes/voice")).default;
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(voiceRouter);
  app.use(errorHandler);
  return app;
}

function createFakeAudioStream(data: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(data));
      controller.close();
    },
  });
}

const VALID_BASE64_AUDIO = Buffer.from("x".repeat(200)).toString("base64");
const SMALL_BASE64_AUDIO = Buffer.from("x".repeat(10)).toString("base64");

describe("POST /voice/transcribe", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("returns transcribed text from base64 audio", async () => {
    const audioData = `data:audio/webm;base64,${VALID_BASE64_AUDIO}`;
    const audioBuffer = Buffer.from(VALID_BASE64_AUDIO, "base64");
    mockEnsureCompatibleFormat.mockResolvedValue({ buffer: audioBuffer, format: "webm" });
    mockSpeechToText.mockResolvedValue("Hello, how are you?");

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: audioData });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Hello, how are you?");
    expect(res.body.language).toBe("en");
    expect(mockEnsureCompatibleFormat).toHaveBeenCalledWith(audioBuffer);
    expect(mockSpeechToText).toHaveBeenCalledWith(audioBuffer, "webm");
  });

  it("handles raw base64 without data URI prefix", async () => {
    mockEnsureCompatibleFormat.mockResolvedValue({ buffer: Buffer.from(VALID_BASE64_AUDIO, "base64"), format: "webm" });
    mockSpeechToText.mockResolvedValue("Raw audio result");

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: VALID_BASE64_AUDIO });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Raw audio result");
  });

  it("detects MIME types from data URI (wav)", async () => {
    const wavAudio = `data:audio/wav;base64,${VALID_BASE64_AUDIO}`;
    mockEnsureCompatibleFormat.mockResolvedValue({ buffer: Buffer.alloc(200), format: "wav" });
    mockSpeechToText.mockResolvedValue("wav result");

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: wavAudio });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("wav result");
  });

  it("detects MIME types from data URI (mp3)", async () => {
    const mp3Audio = `data:audio/mp3;base64,${VALID_BASE64_AUDIO}`;
    mockEnsureCompatibleFormat.mockResolvedValue({ buffer: Buffer.alloc(200), format: "mp3" });
    mockSpeechToText.mockResolvedValue("mp3 result");

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: mp3Audio });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("mp3 result");
  });

  it("returns 400 when audio field is missing", async () => {
    const res = await request(app)
      .post("/voice/transcribe")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when audio field is empty", async () => {
    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: "" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when decoded audio buffer is empty", async () => {
    const emptyAudio = `data:audio/webm;base64,`;
    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: emptyAudio });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("No audio data");
  });

  it("returns 400 when audio exceeds 10MB", async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, "x");
    const largeBase64 = `data:audio/webm;base64,${largeBuffer.toString("base64")}`;

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: largeBase64 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("too large");
  });

  it("propagates STT errors as 500", async () => {
    mockEnsureCompatibleFormat.mockResolvedValue({ buffer: Buffer.alloc(200), format: "webm" });
    mockSpeechToText.mockRejectedValue(new Error("OpenAI Whisper unavailable"));

    const res = await request(app)
      .post("/voice/transcribe")
      .send({ audio: `data:audio/webm;base64,${VALID_BASE64_AUDIO}` });

    expect(res.status).toBe(500);
  });
});

describe("POST /voice/clone", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("clones a voice with valid samples", async () => {
    mockCloneVoice.mockResolvedValue({ voiceId: "cloned-voice-123", name: "My Voice" });

    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "My Voice",
        description: "A test clone",
        samples: [`data:audio/mp3;base64,${VALID_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(200);
    expect(res.body.voiceId).toBe("cloned-voice-123");
    expect(res.body.name).toBe("My Voice");
    expect(res.body.description).toBe("A test clone");
    expect(mockCloneVoice).toHaveBeenCalledWith(
      "My Voice",
      expect.any(Array),
      "A test clone",
    );
  });

  it("clones a voice without description", async () => {
    mockCloneVoice.mockResolvedValue({ voiceId: "cloned-456", name: "No Desc" });

    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "No Desc",
        samples: [`data:audio/mp3;base64,${VALID_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(200);
    expect(res.body.voiceId).toBe("cloned-456");
    expect(res.body.description).toBe("");
  });

  it("supports multiple audio samples", async () => {
    mockCloneVoice.mockResolvedValue({ voiceId: "multi-sample", name: "Multi" });

    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "Multi",
        samples: [
          `data:audio/mp3;base64,${VALID_BASE64_AUDIO}`,
          `data:audio/wav;base64,${VALID_BASE64_AUDIO}`,
          `data:audio/webm;base64,${VALID_BASE64_AUDIO}`,
        ],
      });

    expect(res.status).toBe(200);
    const calledSamples = mockCloneVoice.mock.calls[0][1];
    expect(calledSamples).toHaveLength(3);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/voice/clone")
      .send({
        samples: [`data:audio/mp3;base64,${VALID_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when samples array is empty", async () => {
    const res = await request(app)
      .post("/voice/clone")
      .send({ name: "Test", samples: [] });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when a sample is too small", async () => {
    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "Tiny Sample",
        samples: [`data:audio/mp3;base64,${SMALL_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("too small");
  });

  it("returns 400 when a sample exceeds 10MB", async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, "x");
    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "Large Sample",
        samples: [`data:audio/mp3;base64,${largeBuffer.toString("base64")}`],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("under 10MB");
  });

  it("returns 400 when ElevenLabs clone API fails", async () => {
    mockCloneVoice.mockRejectedValue(new Error("ElevenLabs voice cloning error: 422 Invalid audio"));

    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "Bad Clone",
        samples: [`data:audio/mp3;base64,${VALID_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ElevenLabs");
  });

  it("returns 500 for non-ElevenLabs errors", async () => {
    mockCloneVoice.mockRejectedValue(new Error("Network timeout"));

    const res = await request(app)
      .post("/voice/clone")
      .send({
        name: "Network Fail",
        samples: [`data:audio/mp3;base64,${VALID_BASE64_AUDIO}`],
      });

    expect(res.status).toBe(500);
  });
});

describe("POST /voice/synthesize – multilingual TTS", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("synthesizes speech with default English model", async () => {
    const fakeStream = createFakeAudioStream("fake-audio-bytes");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Hello world" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("audio/mpeg");
    expect(res.headers["x-voice-profile"]).toBeDefined();

    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[0]).toBe("Hello world");
    expect(callArgs[1].modelId).toBeUndefined();
  });

  it("uses multilingual model for non-English language", async () => {
    const fakeStream = createFakeAudioStream("spanish-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Hola mundo", language: "es" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].modelId).toBe("eleven_multilingual_v2");
  });

  it("uses default model when language is 'en'", async () => {
    const fakeStream = createFakeAudioStream("english-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "English text", language: "en" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].modelId).toBeUndefined();
  });

  it("uses multilingual model for Japanese", async () => {
    const fakeStream = createFakeAudioStream("japanese-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "こんにちは", language: "ja" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].modelId).toBe("eleven_multilingual_v2");
  });

  it("uses multilingual model for Chinese", async () => {
    const fakeStream = createFakeAudioStream("chinese-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "你好世界", language: "zh" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].modelId).toBe("eleven_multilingual_v2");
  });

  it("passes custom voiceId to TTS", async () => {
    const fakeStream = createFakeAudioStream("custom-voice-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Custom voice", voiceId: "my-cloned-voice-id" });

    expect(res.status).toBe(200);
    expect(res.headers["x-voice-id"]).toBe("my-cloned-voice-id");
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].voiceId).toBe("my-cloned-voice-id");
  });

  it("applies personality voice settings", async () => {
    const fakeStream = createFakeAudioStream("personality-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({
        text: "Personality test",
        personality: { energy: 0.9, formality: 0.8, warmth: 0.7 },
      });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].stability).toBeGreaterThan(0);
    expect(callArgs[1].similarityBoost).toBeGreaterThan(0);
  });

  it("resolves voice profile from roleTitle", async () => {
    const fakeStream = createFakeAudioStream("role-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Engineering report", roleTitle: "Senior Engineer", department: "engineering" });

    expect(res.status).toBe(200);
    expect(res.headers["x-voice-profile"]).toBe("Adam (Technical)");
  });

  it("allows custom stability and similarityBoost overrides", async () => {
    const fakeStream = createFakeAudioStream("override-audio");
    mockTextToSpeechStream.mockResolvedValue({
      body: fakeStream,
      contentType: "audio/mpeg",
    });

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Override params", stability: 0.9, similarityBoost: 0.3, speed: 1.5 });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechStream.mock.calls[0];
    expect(callArgs[1].stability).toBe(0.9);
    expect(callArgs[1].similarityBoost).toBe(0.3);
    expect(callArgs[1].speed).toBe(1.5);
  });

  it("returns 400 when text is missing", async () => {
    const res = await request(app)
      .post("/voice/synthesize")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when text is empty", async () => {
    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when text exceeds 5000 chars", async () => {
    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "a".repeat(5001) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when ElevenLabs TTS fails", async () => {
    mockTextToSpeechStream.mockRejectedValue(new Error("ElevenLabs TTS stream error: 429 Rate limited"));

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Rate limited" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ElevenLabs");
  });

  it("returns 500 for non-ElevenLabs errors", async () => {
    mockTextToSpeechStream.mockRejectedValue(new Error("Connection refused"));

    const res = await request(app)
      .post("/voice/synthesize")
      .send({ text: "Connection error" });

    expect(res.status).toBe(500);
  });
});

describe("POST /voice/synthesize-aligned", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("returns audio with alignment and viseme data", async () => {
    const fakeAudio = Buffer.from("fake-aligned-audio");
    mockTextToSpeechWithAlignment.mockResolvedValue({
      audio: fakeAudio,
      alignment: {
        chars: ["H", "i"],
        charStartTimesMs: [0, 100],
        charDurationsMs: [100, 150],
      },
      visemes: [
        { viseme: "DD", startMs: 0, durationMs: 100 },
        { viseme: "IH", startMs: 100, durationMs: 150 },
      ],
    });

    const res = await request(app)
      .post("/voice/synthesize-aligned")
      .send({ text: "Hi" });

    expect(res.status).toBe(200);
    expect(res.body.audio).toMatch(/^data:audio\/mpeg;base64,/);
    expect(res.body.alignment).toBeDefined();
    expect(res.body.alignment.chars).toEqual(["H", "i"]);
    expect(res.body.visemes).toHaveLength(2);
    expect(res.body.emotion).toBeDefined();
    expect(res.body.voiceProfile).toBeDefined();
  });

  it("uses multilingual model for non-English aligned synthesis", async () => {
    mockTextToSpeechWithAlignment.mockResolvedValue({
      audio: Buffer.from("french-audio"),
      alignment: null,
      visemes: [],
    });

    const res = await request(app)
      .post("/voice/synthesize-aligned")
      .send({ text: "Bonjour le monde", language: "fr" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechWithAlignment.mock.calls[0];
    expect(callArgs[1].modelId).toBe("eleven_multilingual_v2");
  });

  it("does not use multilingual model for English aligned synthesis", async () => {
    mockTextToSpeechWithAlignment.mockResolvedValue({
      audio: Buffer.from("english-audio"),
      alignment: null,
      visemes: [],
    });

    const res = await request(app)
      .post("/voice/synthesize-aligned")
      .send({ text: "Hello world", language: "en" });

    expect(res.status).toBe(200);
    const callArgs = mockTextToSpeechWithAlignment.mock.calls[0];
    expect(callArgs[1].modelId).toBeUndefined();
  });

  it("returns 400 for ElevenLabs alignment errors", async () => {
    mockTextToSpeechWithAlignment.mockRejectedValue(new Error("ElevenLabs TTS alignment error: 500"));

    const res = await request(app)
      .post("/voice/synthesize-aligned")
      .send({ text: "Error test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ElevenLabs");
  });
});

describe("GET /voice/languages", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("returns list of supported languages", async () => {
    const res = await request(app).get("/voice/languages");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);

    const english = res.body.data.find((l: { code: string }) => l.code === "en");
    expect(english).toBeDefined();
    expect(english.name).toBe("English");

    const spanish = res.body.data.find((l: { code: string }) => l.code === "es");
    expect(spanish).toBeDefined();
    expect(spanish.name).toBe("Spanish");
  });

  it("each language has code and name fields", async () => {
    const res = await request(app).get("/voice/languages");

    expect(res.status).toBe(200);
    for (const lang of res.body.data) {
      expect(lang).toHaveProperty("code");
      expect(lang).toHaveProperty("name");
      expect(typeof lang.code).toBe("string");
      expect(typeof lang.name).toBe("string");
    }
  });
});

describe("GET /voice/profiles", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("returns list of voice profiles", async () => {
    const res = await request(app).get("/voice/profiles");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(5);

    const categories = res.body.data.map((p: { category: string }) => p.category);
    expect(categories).toContain("warm");
    expect(categories).toContain("authoritative");
    expect(categories).toContain("technical");
    expect(categories).toContain("creative");
    expect(categories).toContain("neutral");
  });

  it("each profile has required fields", async () => {
    const res = await request(app).get("/voice/profiles");

    expect(res.status).toBe(200);
    for (const profile of res.body.data) {
      expect(profile).toHaveProperty("category");
      expect(profile).toHaveProperty("label");
      expect(profile).toHaveProperty("description");
      expect(profile).toHaveProperty("voiceId");
    }
  });
});
