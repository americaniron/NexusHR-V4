import { Loader2, CheckCircle2, Clock } from "lucide-react";
import type { ChatMessageData } from "./types";

interface StatusUpdateProps {
  message: ChatMessageData;
}

export function StatusUpdate({ message }: StatusUpdateProps) {
  const percent = message.metadata?.progressPercent ?? 0;
  const label = message.metadata?.progressLabel || "In progress";
  const isComplete = percent >= 100;

  return (
    <div className="max-w-[85%] flex items-start gap-3">
      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isComplete ? "bg-green-500/10" : "bg-blue-500/10"
      }`}>
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : percent > 0 ? (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status Update</span>
          <span className={`text-xs font-medium ${isComplete ? "text-green-600" : "text-blue-600"}`}>
            {label}
          </span>
        </div>
        <p className="text-sm text-foreground">{message.content}</p>
        {percent > 0 && (
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
