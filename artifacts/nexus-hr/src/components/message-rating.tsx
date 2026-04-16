import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MessageRatingProps {
  messageId: number;
  conversationId: number;
  aiEmployeeId: number;
  initialRating?: number | null;
}

export function MessageRating({ messageId, conversationId, aiEmployeeId, initialRating }: MessageRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const handleRate = async (value: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/analytics/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId, conversationId, aiEmployeeId, rating: value }),
      });
      if (res.ok) {
        setRating(value);
      }
    } catch {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 ${rating === 1 ? "text-green-500" : "text-muted-foreground/40 hover:text-green-500"}`}
        onClick={() => handleRate(1)}
        disabled={submitting}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 ${rating === 0 ? "text-red-500" : "text-muted-foreground/40 hover:text-red-500"}`}
        onClick={() => handleRate(0)}
        disabled={submitting}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
