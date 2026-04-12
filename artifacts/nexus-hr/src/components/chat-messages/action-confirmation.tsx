import { ShieldCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ChatMessageData } from "./types";

interface ActionConfirmationProps {
  message: ChatMessageData;
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
}

export function ActionConfirmation({ message, onApprove, onReject }: ActionConfirmationProps) {
  const actionId = message.metadata?.actionId || String(message.id);
  const actionLabel = message.metadata?.actionLabel || "Confirm Action";
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    message.metadata?.actionStatus || "pending"
  );

  const handleApprove = () => {
    setStatus("approved");
    onApprove?.(actionId);
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.(actionId);
  };

  return (
    <div className="max-w-[85%] rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
        <ShieldCheck className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">Action Required</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground mb-1">{message.content}</p>
        <p className="text-xs text-muted-foreground">{actionLabel}</p>
      </div>

      {status === "pending" ? (
        <div className="flex gap-2 px-4 pb-3">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={handleApprove}
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
            onClick={handleReject}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      ) : (
        <div className={`px-4 pb-3 flex items-center gap-2 text-sm font-medium ${
          status === "approved" ? "text-green-600" : "text-red-600"
        }`}>
          {status === "approved" ? (
            <><Check className="h-4 w-4" /> Approved</>
          ) : (
            <><X className="h-4 w-4" /> Rejected</>
          )}
        </div>
      )}
    </div>
  );
}
