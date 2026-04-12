import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ChatMessageData } from "./types";

interface DataCardProps {
  message: ChatMessageData;
}

export function DataCard({ message }: DataCardProps) {
  const [expanded, setExpanded] = useState(false);
  const title = message.metadata?.dataTitle || "Data Summary";
  const rows = message.metadata?.dataRows || [];

  return (
    <div className="max-w-[85%] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {rows.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{message.content}</p>
      </div>

      {expanded && rows.length > 0 && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/20">
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border/50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-3 py-2 text-foreground">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
