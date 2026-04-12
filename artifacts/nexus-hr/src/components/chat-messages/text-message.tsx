import type { ChatMessageData } from "./types";

interface TextMessageProps {
  message: ChatMessageData;
  isUser: boolean;
}

export function TextMessage({ message, isUser }: TextMessageProps) {
  return (
    <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
      isUser
        ? "bg-primary text-primary-foreground rounded-tr-sm"
        : "bg-muted text-foreground rounded-tl-sm border border-border/50"
    }`}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
