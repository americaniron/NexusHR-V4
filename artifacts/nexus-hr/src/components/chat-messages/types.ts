export type MessageType =
  | "text"
  | "voice_transcription"
  | "data_card"
  | "file_attachment"
  | "action_confirmation"
  | "status_update"
  | "quick_reply"
  | "escalation_notice";

export type EmotionState =
  | "neutral"
  | "enthusiastic"
  | "empathetic"
  | "focused"
  | "reassuring"
  | "apologetic"
  | "thoughtful";

export interface ChatMessageData {
  id: number;
  role: "user" | "assistant";
  content: string;
  messageType?: MessageType;
  metadata?: {
    emotion?: EmotionState;
    emotionIntensity?: number;
    quickReplies?: string[];
    actionId?: string;
    actionLabel?: string;
    actionStatus?: "pending" | "approved" | "rejected";
    dataTitle?: string;
    dataRows?: Array<Record<string, string | number>>;
    fileName?: string;
    fileUrl?: string;
    fileSize?: string;
    progressPercent?: number;
    progressLabel?: string;
    escalationLevel?: "low" | "medium" | "high" | "critical";
    escalationReason?: string;
  };
  audioUrl?: string | null;
  createdAt?: string;
}
