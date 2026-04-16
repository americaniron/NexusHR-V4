import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AIAvatar } from "@/components/ai-avatar";
import { AudioWaveformPlayer } from "@/components/audio-waveform-player";
import { MessageRating } from "@/components/message-rating";
import { User, Sparkles } from "lucide-react";
import type { ChatMessageData } from "./types";
import { TextMessage } from "./text-message";
import { VoiceTranscription } from "./voice-transcription";
import { DataCard } from "./data-card";
import { FileAttachment } from "./file-attachment";
import { ActionConfirmation } from "./action-confirmation";
import { StatusUpdate } from "./status-update";
import { QuickReply } from "./quick-reply";
import { EscalationNotice } from "./escalation-notice";
import type { AvatarVisualState } from "@/components/ai-avatar";

interface ChatMessageProps {
  message: ChatMessageData;
  avatarUrl?: string | null;
  avatarName?: string;
  conversationId?: number;
  aiEmployeeId?: number;
  onPlayStateChange?: (playing: boolean) => void;
  onQuickReply?: (reply: string) => void;
  onActionApprove?: (actionId: string) => void;
  onActionReject?: (actionId: string) => void;
}

const EMOTION_BADGES: Record<string, { label: string; className: string }> = {
  enthusiastic: { label: "Enthusiastic", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  empathetic: { label: "Empathetic", className: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  focused: { label: "Focused", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  reassuring: { label: "Reassuring", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  apologetic: { label: "Apologetic", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  thoughtful: { label: "Thoughtful", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
};

export function ChatMessage({
  message,
  avatarUrl,
  avatarName,
  conversationId,
  aiEmployeeId,
  onPlayStateChange,
  onQuickReply,
  onActionApprove,
  onActionReject,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const messageType = message.messageType || "text";
  const emotion = message.metadata?.emotion;
  const quickReplies = message.metadata?.quickReplies || [];
  const emotionBadge = emotion && emotion !== "neutral" ? EMOTION_BADGES[emotion] : null;
  const isProactive = messageType === "proactive" || message.metadata?.proactive;
  const isTest = message.metadata?.isTest;

  if (messageType === "status_update") {
    return (
      <div className="flex justify-center py-1">
        <StatusUpdate message={message} />
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0 border border-border/50">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <AIAvatar
          src={avatarUrl}
          name={avatarName}
          size="sm"
        />
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {isProactive && !isUser && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 text-[10px] font-medium rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Sparkles className="h-3 w-3" />
            {isTest ? "Test" : "Proactive"}{message.metadata?.proactiveRuleName ? ` — ${message.metadata.proactiveRuleName}` : ""}
          </span>
        )}

        {emotionBadge && !isUser && !isProactive && (
          <span className={`inline-flex items-center px-2 py-0.5 mb-1 text-[10px] font-medium rounded-full border ${emotionBadge.className}`}>
            {emotionBadge.label}
          </span>
        )}

        {(messageType === "text" || messageType === "proactive") && <TextMessage message={message} isUser={isUser} />}
        {messageType === "voice_transcription" && <VoiceTranscription message={message} isUser={isUser} />}
        {messageType === "data_card" && <DataCard message={message} />}
        {messageType === "file_attachment" && <FileAttachment message={message} />}
        {messageType === "action_confirmation" && (
          <ActionConfirmation
            message={message}
            onApprove={onActionApprove}
            onReject={onActionReject}
          />
        )}
        {messageType === "escalation_notice" && <EscalationNotice message={message} />}

        {!isUser && message.audioUrl && (
          <AudioWaveformPlayer
            src={message.audioUrl}
            compact
            className="mt-1"
            onPlayStateChange={onPlayStateChange}
          />
        )}

        {!isUser && conversationId && aiEmployeeId && (
          <MessageRating
            messageId={message.id}
            conversationId={conversationId}
            aiEmployeeId={aiEmployeeId}
          />
        )}

        {!isUser && quickReplies.length > 0 && onQuickReply && (
          <QuickReply replies={quickReplies} onSelect={onQuickReply} />
        )}
      </div>
    </div>
  );
}
