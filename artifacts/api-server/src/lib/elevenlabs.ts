const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

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
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
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
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
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
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
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
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs voices error: ${response.status}`);
  }

  const data = await response.json() as { voices: Array<Record<string, unknown>> };
  return data.voices;
}
