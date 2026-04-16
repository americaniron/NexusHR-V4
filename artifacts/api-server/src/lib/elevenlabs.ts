import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io";

function useProxy(): boolean {
  return !ELEVENLABS_API_KEY;
}

async function elevenLabsFetch(path: string, init?: RequestInit): Promise<Response> {
  if (useProxy()) {
    return connectors.proxy("elevenlabs", path, {
      method: init?.method || "GET",
      headers: init?.headers as Record<string, string> | undefined,
      body: init?.body as string | undefined,
    });
  }
  return fetch(`${ELEVENLABS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...(init?.headers as Record<string, string> || {}),
    },
  });
}

export async function textToSpeech(
  text: string,
  options?: {
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    speed?: number;
    style?: number;
  }
) {
  const voiceId = options?.voiceId || "21m00Tcm4TlvDq8ikWAM";
  const response = await elevenLabsFetch(
    `/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
          style: options?.style ?? 0.3,
          use_speaker_boost: true,
        },
        ...(options?.speed && options.speed !== 1.0 ? { generation_config: { speed: options.speed } } : {}),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export interface AlignmentData {
  chars: string[];
  charStartTimesMs: number[];
  charDurationsMs: number[];
}

export interface VisemeData {
  viseme: string;
  startMs: number;
  durationMs: number;
}

const PHONEME_TO_VISEME: Record<string, string> = {
  a: "AA", e: "EE", i: "IH", o: "OH", u: "UU",
  b: "PP", p: "PP", m: "PP",
  f: "FF", v: "FF",
  th: "TH",
  d: "DD", t: "DD", n: "DD", l: "DD",
  k: "KK", g: "KK",
  ch: "CH", j: "CH", sh: "CH",
  s: "SS", z: "SS",
  r: "RR",
  w: "WW",
  " ": "IDLE",
};

export function alignmentToVisemes(alignment: AlignmentData): VisemeData[] {
  const visemes: VisemeData[] = [];
  for (let i = 0; i < alignment.chars.length; i++) {
    const char = alignment.chars[i].toLowerCase();
    const viseme = PHONEME_TO_VISEME[char] || "DD";
    const startMs = alignment.charStartTimesMs[i];
    const durationMs = alignment.charDurationsMs[i];
    if (visemes.length > 0 && visemes[visemes.length - 1].viseme === viseme) {
      visemes[visemes.length - 1].durationMs += durationMs;
    } else {
      visemes.push({ viseme, startMs, durationMs });
    }
  }
  return visemes;
}

export async function textToSpeechStream(
  text: string,
  options?: {
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    speed?: number;
    style?: number;
  }
): Promise<{ body: ReadableStream<Uint8Array>; contentType: string }> {
  const voiceId = options?.voiceId || "21m00Tcm4TlvDq8ikWAM";
  const response = await elevenLabsFetch(
    `/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
          style: options?.style ?? 0.3,
          use_speaker_boost: true,
        },
        ...(options?.speed && options.speed !== 1.0 ? { generation_config: { speed: options.speed } } : {}),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS stream error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("ElevenLabs TTS stream returned no body");
  }

  return {
    body: response.body as unknown as ReadableStream<Uint8Array>,
    contentType: response.headers.get("content-type") || "audio/mpeg",
  };
}

export async function textToSpeechWithAlignment(
  text: string,
  options?: {
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    speed?: number;
    style?: number;
  }
): Promise<{ audio: Buffer; alignment: AlignmentData | null; visemes: VisemeData[] }> {
  const voiceId = options?.voiceId || "21m00Tcm4TlvDq8ikWAM";
  const response = await elevenLabsFetch(
    `/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
          style: options?.style ?? 0.3,
          use_speaker_boost: true,
        },
        ...(options?.speed && options.speed !== 1.0 ? { generation_config: { speed: options.speed } } : {}),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs TTS alignment error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    audio_base64: string;
    alignment?: AlignmentData;
  };

  const audio = Buffer.from(data.audio_base64, "base64");
  const alignment = data.alignment || null;
  const visemes = alignment ? alignmentToVisemes(alignment) : [];

  return { audio, alignment, visemes };
}

export async function listVoices() {
  const response = await elevenLabsFetch(`/v1/voices`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs voices error: ${response.status}`);
  }

  const data = await response.json() as { voices: Array<Record<string, unknown>> };
  return data.voices;
}

export async function cloneVoice(
  name: string,
  samples: Buffer[],
  description?: string
): Promise<{ voiceId: string; name: string }> {
  const boundary = `----ElevenLabsBoundary${Date.now()}`;
  const parts: Buffer[] = [];

  const addField = (fieldName: string, value: string) => {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"\r\n\r\n${value}\r\n`));
  };

  addField("name", name);
  if (description) {
    addField("description", description);
  }

  for (let i = 0; i < samples.length; i++) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="sample_${i}.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n`
    ));
    parts.push(samples[i]);
    parts.push(Buffer.from("\r\n"));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  const response = await elevenLabsFetch(`/v1/voices/add`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: body as unknown as string,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs voice cloning error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { voice_id: string };
  return { voiceId: data.voice_id, name };
}

export async function listClonedVoices(): Promise<Array<{ voice_id: string; name: string; category: string; description?: string; created_at?: string }>> {
  const response = await elevenLabsFetch(`/v1/voices`, { method: "GET" });

  if (!response.ok) {
    throw new Error(`ElevenLabs list voices error: ${response.status}`);
  }

  const data = await response.json() as { voices: Array<{ voice_id: string; name: string; category: string; description?: string; labels?: Record<string, string>; created_at_unix_secs?: number }> };
  return data.voices
    .filter(v => v.category === "cloned")
    .map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.description,
      created_at: v.created_at_unix_secs ? new Date(v.created_at_unix_secs * 1000).toISOString() : undefined,
    }));
}

export async function deleteClonedVoice(voiceId: string): Promise<void> {
  const response = await elevenLabsFetch(`/v1/voices/${voiceId}`, { method: "DELETE" });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs delete voice error: ${response.status} ${errorText}`);
  }
}

export async function generateSttToken(): Promise<string> {
  const response = await elevenLabsFetch(`/v1/speech-to-text/get-websocket-token`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs STT token error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { token: string };
  return data.token;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "pl", name: "Polish" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "fi", name: "Finnish" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh", name: "Chinese" },
];
