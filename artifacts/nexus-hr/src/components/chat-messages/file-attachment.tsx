import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessageData } from "./types";

interface FileAttachmentProps {
  message: ChatMessageData;
}

export function FileAttachment({ message }: FileAttachmentProps) {
  const fileName = message.metadata?.fileName || "document.pdf";
  const fileSize = message.metadata?.fileSize || "";
  const fileUrl = message.metadata?.fileUrl;

  return (
    <div className="max-w-[80%]">
      <div className="rounded-2xl px-4 py-2.5 bg-muted text-foreground rounded-tl-sm border border-border/50 mb-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
          {fileSize && <p className="text-xs text-muted-foreground">{fileSize}</p>}
        </div>
        {fileUrl && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
            <a href={fileUrl} download={fileName}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
