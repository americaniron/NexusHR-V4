import { useState, useEffect, useRef } from "react";
import { Bot, Sparkles } from "lucide-react";

interface AIMessage {
  text: string;
  isTyping?: boolean;
}

interface AIAssistantProps {
  messages: string[];
  stepTitle: string;
}

function TypingText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <>{displayed}<span className="animate-pulse">|</span></>;
}

export function AIAssistant({ messages, stepTitle }: AIAssistantProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [typingDone, setTypingDone] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(1);
    setTypingDone(new Set());
  }, [stepTitle]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, typingDone]);

  const handleTypingComplete = (idx: number) => {
    setTypingDone((prev) => new Set(prev).add(idx));
    if (idx < messages.length - 1) {
      setTimeout(() => setVisibleCount((prev) => Math.min(prev + 1, messages.length)), 400);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">NexsusHR AI Guide</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Active</span>
        </div>
      </div>
      <div ref={scrollRef} className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div key={`${stepTitle}-${i}`} className="flex gap-2.5">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {typingDone.has(i) ? msg : <TypingText text={msg} onComplete={() => handleTypingComplete(i)} />}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
