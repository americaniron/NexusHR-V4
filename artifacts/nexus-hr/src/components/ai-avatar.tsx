import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvatarVisualState = "idle" | "speaking" | "thinking" | "listening";

export type EmotionState =
  | "neutral"
  | "enthusiastic"
  | "empathetic"
  | "focused"
  | "reassuring"
  | "apologetic"
  | "thoughtful";

interface AIAvatarProps {
  src?: string | null;
  name?: string;
  roleTitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
  visualState?: AvatarVisualState;
  audioLevel?: number;
  emotion?: EmotionState;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-5 w-5",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
  xl: "text-2xl",
};

const labelTextSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const roleLabelSizes = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

const stateRingClasses: Record<AvatarVisualState, string> = {
  idle: "border-primary/20",
  speaking: "border-primary animate-avatar-speaking shadow-[0_0_12px_rgba(var(--primary-rgb,200,120,50),0.4)]",
  thinking: "border-yellow-500/50 animate-avatar-thinking",
  listening: "border-green-500/60 animate-avatar-listening shadow-[0_0_8px_rgba(34,197,94,0.3)]",
};

const emotionGlowClasses: Record<EmotionState, string> = {
  neutral: "",
  enthusiastic: "shadow-[0_0_16px_rgba(251,146,60,0.35)]",
  empathetic: "shadow-[0_0_16px_rgba(236,72,153,0.3)]",
  focused: "shadow-[0_0_16px_rgba(59,130,246,0.3)]",
  reassuring: "shadow-[0_0_16px_rgba(34,197,94,0.3)]",
  apologetic: "shadow-[0_0_16px_rgba(168,85,247,0.3)]",
  thoughtful: "shadow-[0_0_16px_rgba(99,102,241,0.3)]",
};

const emotionRingClasses: Record<EmotionState, string> = {
  neutral: "",
  enthusiastic: "border-orange-400",
  empathetic: "border-pink-400",
  focused: "border-blue-400",
  reassuring: "border-green-400",
  apologetic: "border-purple-400",
  thoughtful: "border-indigo-400",
};

const dotSizes = {
  sm: "h-1 w-1",
  md: "h-1.5 w-1.5",
  lg: "h-2 w-2",
  xl: "h-2.5 w-2.5",
};

const micIndicatorSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

const indicatorPositions = {
  sm: "-bottom-0.5 -right-0.5",
  md: "-bottom-0.5 -right-0.5",
  lg: "-bottom-1 -right-1",
  xl: "-bottom-1 -right-1",
};

export function AIAvatar({
  src,
  name,
  roleTitle,
  size = "md",
  showLabel = false,
  className,
  visualState = "idle",
  audioLevel = 0,
  emotion = "neutral",
}: AIAvatarProps) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const hasEmotion = emotion !== "neutral" && visualState === "speaking";

  const avatar = (
    <div className="relative inline-flex">
      {hasEmotion && (
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          emotionGlowClasses[emotion],
        )} />
      )}

      <Avatar className={cn(
        sizeClasses[size],
        "border-2 shadow-md transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        hasEmotion ? emotionRingClasses[emotion] : stateRingClasses[visualState],
        !hasEmotion && stateRingClasses[visualState],
        !showLabel && className,
      )}>
        {src && <AvatarImage src={src} alt={name || "AI Avatar"} />}
        <AvatarFallback className={cn("bg-primary/10 text-primary", textSizes[size])}>
          {initials || <Zap className={iconSizes[size]} />}
        </AvatarFallback>
      </Avatar>

      {visualState === "idle" && emotion !== "neutral" && (
        <div className={cn(
          "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-card transition-all duration-500",
          emotion === "enthusiastic" && "bg-orange-400",
          emotion === "empathetic" && "bg-pink-400",
          emotion === "focused" && "bg-blue-400",
          emotion === "reassuring" && "bg-green-400",
          emotion === "apologetic" && "bg-purple-400",
          emotion === "thoughtful" && "bg-indigo-400",
        )} />
      )}

      {visualState === "speaking" && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={cn(
                "rounded-full animate-waveform-bar",
                hasEmotion
                  ? emotion === "enthusiastic" ? "bg-orange-400"
                  : emotion === "empathetic" ? "bg-pink-400"
                  : emotion === "focused" ? "bg-blue-400"
                  : emotion === "reassuring" ? "bg-green-400"
                  : emotion === "apologetic" ? "bg-purple-400"
                  : emotion === "thoughtful" ? "bg-indigo-400"
                  : "bg-primary"
                  : "bg-primary",
              )}
              style={{
                width: size === "sm" ? 2 : 3,
                animationDelay: `${i * 0.1}s`,
                height: size === "sm" ? 6 : size === "md" ? 8 : 12,
              }}
            />
          ))}
        </div>
      )}

      {visualState === "thinking" && (
        <div className={cn("absolute flex gap-0.5", indicatorPositions[size])}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn("rounded-full bg-yellow-500 animate-thinking-dot", dotSizes[size])}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      )}

      {visualState === "listening" && (
        <div className={cn("absolute flex items-center justify-center rounded-full bg-green-500 text-white", indicatorPositions[size], micIndicatorSizes[size])}>
          <Mic className={cn(size === "sm" ? "h-2 w-2" : "h-3 w-3")} />
          {audioLevel > 0.1 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"
              style={{ opacity: Math.min(audioLevel, 0.8) }}
            />
          )}
        </div>
      )}
    </div>
  );

  if (!showLabel || (!name && !roleTitle)) {
    return avatar;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {avatar}
      <div className="flex flex-col min-w-0">
        {name && (
          <span className={cn("font-medium text-foreground truncate", labelTextSizes[size])}>
            {name}
          </span>
        )}
        {roleTitle && (
          <span className={cn("text-muted-foreground truncate", roleLabelSizes[size])}>
            {roleTitle}
          </span>
        )}
        {visualState !== "idle" && (
          <span className={cn("text-muted-foreground truncate capitalize", roleLabelSizes[size])}>
            {visualState === "speaking" ? "Speaking..." : visualState === "thinking" ? "Thinking..." : "Listening..."}
          </span>
        )}
      </div>
    </div>
  );
}
