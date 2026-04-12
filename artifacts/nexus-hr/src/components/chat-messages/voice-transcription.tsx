import { Mic } from "lucide-react";
import type { ChatMessageData } from "./types";

interface VoiceTranscriptionProps {
  message: ChatMessageData;
  isUser: boolean;
}

export function VoiceTranscription({ message, isUser }: VoiceTranscriptionProps) {
  return (
    <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
      isUser
        ? "bg-primary/80 text-primary-foreground rounded-tr-sm"
        : "bg-muted/60 text-foreground rounded-tl-sm border border-border/30"
    }`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Mic className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Voice</span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap italic">{message.content}</p>
    </div>
  );
}
