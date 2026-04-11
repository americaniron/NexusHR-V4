const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function textToSpeech(
  text: string,
  options?: {
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
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
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
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
