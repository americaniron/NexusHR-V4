import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VideoAvatar } from "@/components/video-avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { EmotionState } from "@/components/ai-avatar";
import type { AvatarAnimationStatus } from "@/hooks/use-avatar-animation";

interface PhotorealisticAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  emotion?: EmotionState;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  audioAnalyser?: AnalyserNode | null;
  remoteStream: MediaStream | null;
  animationStatus: AvatarAnimationStatus;
  provider?: string | null;
  className?: string;
}

export function PhotorealisticAvatar({
  avatarUrl,
  name,
  emotion = "neutral",
  isSpeaking = false,
  isThinking = false,
  isListening = false,
  audioAnalyser,
  remoteStream,
  animationStatus,
  provider,
  className,
}: PhotorealisticAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const isPhotorealistic = animationStatus === "connected" && !!remoteStream;

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setVideoReady(true);
    const handleError = () => setVideoReady(false);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  if (!isPhotorealistic || !videoReady) {
    return (
      <div className={cn("relative", className)}>
        <VideoAvatar
          avatarUrl={avatarUrl}
          name={name}
          emotion={emotion}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          isListening={isListening}
          audioAnalyser={audioAnalyser}
          className="w-full h-full"
        />
        {animationStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Loading photorealistic avatar...
            </Badge>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-[400px] max-h-[400px] rounded-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: isSpeaking
                ? `0 0 20px 4px ${getEmotionGlow(emotion)}, inset 0 0 10px 2px ${getEmotionGlow(emotion)}`
                : isListening
                  ? "0 0 15px 3px rgba(34, 197, 94, 0.3)"
                  : isThinking
                    ? "0 0 15px 3px rgba(234, 179, 8, 0.3)"
                    : "0 0 10px 2px rgba(160, 133, 92, 0.2)",
              transition: "box-shadow 0.3s ease",
            }}
          />

          {isSpeaking && (
            <div className="absolute -inset-1 rounded-full border-2 animate-pulse pointer-events-none"
              style={{ borderColor: getEmotionGlow(emotion) }}
            />
          )}
        </div>
      </div>

      {provider && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20 gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Photorealistic
          </Badge>
        </div>
      )}
    </div>
  );
}

function getEmotionGlow(emotion: EmotionState): string {
  const glowColors: Record<EmotionState, string> = {
    neutral: "rgba(160, 133, 92, 0.3)",
    enthusiastic: "rgba(249, 115, 22, 0.4)",
    empathetic: "rgba(236, 72, 153, 0.4)",
    focused: "rgba(59, 130, 246, 0.4)",
    reassuring: "rgba(34, 197, 94, 0.4)",
    apologetic: "rgba(168, 85, 247, 0.4)",
    thoughtful: "rgba(99, 102, 241, 0.4)",
  };
  return glowColors[emotion] || glowColors.neutral;
}
