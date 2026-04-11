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
