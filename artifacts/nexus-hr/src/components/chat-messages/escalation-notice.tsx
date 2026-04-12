import { AlertTriangle, AlertOctagon, Info, AlertCircle } from "lucide-react";
import type { ChatMessageData } from "./types";

interface EscalationNoticeProps {
  message: ChatMessageData;
}

const LEVEL_CONFIG = {
  low: {
    icon: Info,
    bg: "bg-blue-500/5 border-blue-500/20",
    headerBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    label: "Escalation — Low Priority",
  },
  medium: {
    icon: AlertCircle,
    bg: "bg-amber-500/5 border-amber-500/20",
    headerBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    label: "Escalation — Medium Priority",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-orange-500/5 border-orange-500/20",
    headerBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
    label: "Escalation — High Priority",
  },
  critical: {
    icon: AlertOctagon,
    bg: "bg-red-500/5 border-red-500/20",
    headerBg: "bg-red-500/10",
    iconColor: "text-red-600",
    label: "Escalation — Critical",
  },
};

export function EscalationNotice({ message }: EscalationNoticeProps) {
  const level = message.metadata?.escalationLevel || "medium";
  const reason = message.metadata?.escalationReason;
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <div className={`max-w-[85%] rounded-2xl border overflow-hidden ${config.bg}`}>
      <div className={`flex items-center gap-2 px-4 py-2 ${config.headerBg}`}>
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
        <span className="text-xs font-medium uppercase tracking-wider text-foreground/70">
          {config.label}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
        {reason && (
          <p className="text-xs text-muted-foreground mt-2">Reason: {reason}</p>
        )}
      </div>
    </div>
  );
}
