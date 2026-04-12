import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { EmotionState } from "@/components/ai-avatar";

export interface VisemeData {
  viseme: string;
  startMs: number;
  durationMs: number;
}

interface AvatarAnimatorProps {
  avatarUrl?: string | null;
  name?: string;
  isActive: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening: boolean;
  emotion?: EmotionState;
  visemes?: VisemeData[];
  audioLevel?: number;
  className?: string;
}

const VISEME_SHAPES: Record<string, { width: string; height: string; borderRadius: string }> = {
  IDLE: { width: "30%", height: "6%", borderRadius: "999px" },
  AA: { width: "40%", height: "22%", borderRadius: "50%" },
  EE: { width: "44%", height: "14%", borderRadius: "40%" },
  IH: { width: "36%", height: "12%", borderRadius: "40%" },
  OH: { width: "32%", height: "24%", borderRadius: "50%" },
  UU: { width: "24%", height: "20%", borderRadius: "50%" },
  PP: { width: "34%", height: "4%", borderRadius: "999px" },
  FF: { width: "36%", height: "8%", borderRadius: "40% 40% 50% 50%" },
  TH: { width: "36%", height: "10%", borderRadius: "40%" },
  DD: { width: "34%", height: "12%", borderRadius: "40%" },
  KK: { width: "36%", height: "16%", borderRadius: "45%" },
  CH: { width: "30%", height: "14%", borderRadius: "45%" },
  SS: { width: "28%", height: "8%", borderRadius: "40%" },
  RR: { width: "30%", height: "14%", borderRadius: "50%" },
  WW: { width: "26%", height: "18%", borderRadius: "50%" },
};

const EMOTION_EXPRESSIONS: Record<EmotionState, { eyeScale: number; browOffset: number; mouthCurve: number }> = {
  neutral: { eyeScale: 1, browOffset: 0, mouthCurve: 0 },
  enthusiastic: { eyeScale: 1.15, browOffset: -2, mouthCurve: 3 },
  empathetic: { eyeScale: 1.05, browOffset: 1, mouthCurve: 1 },
  focused: { eyeScale: 0.9, browOffset: 2, mouthCurve: -1 },
  reassuring: { eyeScale: 1.1, browOffset: -1, mouthCurve: 2 },
  apologetic: { eyeScale: 1, browOffset: 3, mouthCurve: -2 },
  thoughtful: { eyeScale: 0.95, browOffset: 2, mouthCurve: 0 },
};

export function AvatarAnimator({
  avatarUrl,
  name,
  isActive,
  isSpeaking,
  isThinking,
  isListening,
  emotion = "neutral",
  visemes,
  audioLevel = 0,
  className,
}: AvatarAnimatorProps) {
  const [currentViseme, setCurrentViseme] = useState("IDLE");
  const [blinkState, setBlinkState] = useState(false);
  const [breathScale, setBreathScale] = useState(1);
  const animFrameRef = useRef<number>(0);
  const visemeStartRef = useRef<number>(0);

  useEffect(() => {
    if (!isSpeaking || !visemes?.length) {
      setCurrentViseme("IDLE");
      return;
    }

    visemeStartRef.current = performance.now();

    const animate = () => {
      const elapsed = performance.now() - visemeStartRef.current;
      let active = "IDLE";

      for (const v of visemes) {
        if (elapsed >= v.startMs && elapsed < v.startMs + v.durationMs) {
          active = v.viseme;
          break;
        }
      }

      setCurrentViseme(active);

      const lastViseme = visemes[visemes.length - 1];
      if (elapsed < lastViseme.startMs + lastViseme.durationMs) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentViseme("IDLE");
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSpeaking, visemes]);

  useEffect(() => {
    if (isSpeaking && !visemes?.length) {
      const shapes = ["IDLE", "AA", "EE", "OH", "DD", "PP", "IH"];
      const interval = setInterval(() => {
        const nextShape = shapes[Math.floor(Math.random() * shapes.length)];
        setCurrentViseme(nextShape);
      }, 120 + Math.random() * 80);
      return () => clearInterval(interval);
    }
    if (!isSpeaking) setCurrentViseme("IDLE");
    return undefined;
  }, [isSpeaking, visemes]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    let frame: number;
    const breathe = () => {
      const t = performance.now() / 1000;
      setBreathScale(1 + Math.sin(t * 0.8) * 0.005);
      frame = requestAnimationFrame(breathe);
    };
    frame = requestAnimationFrame(breathe);
    return () => cancelAnimationFrame(frame);
  }, []);

  const mouthShape = VISEME_SHAPES[currentViseme] || VISEME_SHAPES.IDLE;
  const expr = EMOTION_EXPRESSIONS[emotion];
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "";

  return (
    <div className={cn("relative", className)}>
      <div
        className="relative rounded-full overflow-hidden bg-muted"
        style={{ transform: `scale(${breathScale})`, transition: "transform 0.3s ease" }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name || "AI Avatar"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </div>
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          <div
            className="absolute left-[30%] bg-white/90 rounded-full transition-all duration-100"
            style={{
              top: "38%",
              width: "10%",
              height: blinkState ? "1%" : `${8 * expr.eyeScale}%`,
              transform: `translateY(${expr.browOffset}px)`,
            }}
          />
          <div
            className="absolute left-[60%] bg-white/90 rounded-full transition-all duration-100"
            style={{
              top: "38%",
              width: "10%",
              height: blinkState ? "1%" : `${8 * expr.eyeScale}%`,
              transform: `translateY(${expr.browOffset}px)`,
            }}
          />

          <div
            className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-red-400/60 to-red-500/70 transition-all duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              top: isSpeaking ? "68%" : "72%",
              width: mouthShape.width,
              height: mouthShape.height,
              borderRadius: mouthShape.borderRadius,
              transform: `translateX(-50%) rotate(${expr.mouthCurve}deg)`,
            }}
          />
        </div>

        {isThinking && (
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse rounded-full" />
        )}

        {isListening && (
          <div
            className="absolute inset-0 border-2 border-green-500/40 rounded-full"
            style={{
              transform: `scale(${1 + audioLevel * 0.1})`,
              transition: "transform 0.1s ease",
            }}
          />
        )}
      </div>

      {isSpeaking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-[3px] bg-primary rounded-full animate-waveform-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: 12,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
