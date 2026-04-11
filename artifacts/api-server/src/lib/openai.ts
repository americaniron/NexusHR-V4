import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://ai-proxy.replit.app/v1",
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
    });
  }
  return _openai;
}

export async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: options?.model || "gpt-4o",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  });
  return response.choices[0]?.message?.content || "";
}

export async function generateImage(
  prompt: string,
  options?: {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
  }
) {
  const openai = getOpenAI();
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: options?.size || "1024x1024",
    quality: options?.quality || "standard",
  });
  return response.data[0]?.url || "";
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string) {
  const openai = getOpenAI();
  const file = new File([audioBuffer], filename, { type: "audio/webm" });
  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });
  return response.text;
}
