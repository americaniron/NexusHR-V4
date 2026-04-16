import { getAnthropicClient } from "@workspace/integrations-anthropic-ai/client";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  role: "system" | MessageRole;
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

const MODEL = "claude-opus-4-6";

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const anthropic = getAnthropicClient();

  const systemMsg = messages.find(m => m.role === "system");
  const chatMsgs = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role as MessageRole,
    content: m.content,
  }));

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 8192,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: chatMsgs,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
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

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: MODEL,
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
