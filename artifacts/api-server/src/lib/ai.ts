import { getAnthropicClient } from "@workspace/integrations-anthropic-ai/client";
import OpenAI from "openai";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: "system" | MessageRole;
  content: string;
}

interface ChatOptions {
  model?: "opus" | "sonnet" | "openai";
  temperature?: number;
  maxTokens?: number;
}

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

async function callClaude(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const anthropic = getAnthropicClient();

  const systemMsg = messages.find(m => m.role === "system");
  const chatMsgs = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role as MessageRole,
    content: m.content,
  }));

  const model = options.model === "opus"
    ? "claude-opus-4-6"
    : "claude-sonnet-4-6";

  const response = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 8192,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: chatMsgs,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

async function callOpenAI(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 8192,
  });
  return response.choices[0]?.message?.content || "";
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  if (options.model === "openai") {
    return callOpenAI(messages, options);
  }

  try {
    return await callClaude(messages, options);
  } catch (error) {
    console.error("[AI] Claude call failed, falling back to OpenAI:", error instanceof Error ? error.message : error);
    return callOpenAI(messages, options);
  }
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: ChatOptions = {}
): Promise<string> {
  const anthropic = getAnthropicClient();

  const systemMsg = messages.find(m => m.role === "system");
  const chatMsgs = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role as MessageRole,
    content: m.content,
  }));

  const model = options.model === "opus"
    ? "claude-opus-4-6"
    : "claude-sonnet-4-6";

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model,
    max_tokens: options.maxTokens ?? 8192,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: chatMsgs,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  return fullResponse;
}
