import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CsatSurveyProps {
  conversationId: number;
  aiEmployeeId: number;
  employeeName?: string;
  onDismiss: () => void;
}

export function CsatSurvey({ conversationId, aiEmployeeId, employeeName, onDismiss }: CsatSurveyProps) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const handleSubmit = async () => {
    if (score === 0 || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/analytics/csat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ aiEmployeeId, conversationId, score, feedback: feedback || undefined }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast({ title: "Thank you for your feedback!" });
        setTimeout(onDismiss, 2000);
      }
    } catch {
      toast({ title: "Failed to submit survey", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5 mx-4 mb-2">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-primary font-medium">Thanks for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border mx-4 mb-2 bg-card">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            How was your experience with {employeeName || "this AI professional"}?
          </p>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className="p-0.5 transition-colors"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setScore(value)}
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  value <= (hovered || score)
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
          {score > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {score === 1 ? "Poor" : score === 2 ? "Fair" : score === 3 ? "Good" : score === 4 ? "Great" : "Excellent"}
            </span>
          )}
        </div>
        {score > 0 && (
          <>
            <Textarea
              placeholder="Any additional feedback? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              className="text-sm resize-none bg-background"
            />
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
