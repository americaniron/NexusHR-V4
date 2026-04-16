import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VideoAvatar } from "@/components/video-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2,
  Wifi, WifiOff, AlertTriangle,
} from "lucide-react";
import type { EmotionState } from "@/components/ai-avatar";
import type { VideoCallStatus } from "@/hooks/use-video-call";

interface VideoCallSessionProps {
  status: VideoCallStatus;
  localStream: MediaStream | null;
  ttsAudioAnalyser: AnalyserNode | null;
  isMuted: boolean;
  isCameraOff: boolean;
  connectionQuality: "good" | "fair" | "poor";
  latencyMs: number;
  avatarUrl?: string | null;
  avatarName?: string;
  emotion?: EmotionState;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  className?: string;
}

const qualityConfig = {
  good: { icon: Wifi, color: "text-green-500", label: "Good" },
  fair: { icon: Wifi, color: "text-yellow-500", label: "Fair" },
  poor: { icon: WifiOff, color: "text-red-500", label: "Poor" },
};

export function VideoCallSession({
  status,
  localStream,
  ttsAudioAnalyser,
  isMuted,
  isCameraOff,
  connectionQuality,
  latencyMs,
  avatarUrl,
  avatarName,
  emotion = "neutral",
  isSpeaking = false,
  isThinking = false,
  isListening = false,
  isRecording = false,
  isTranscribing = false,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  onStartRecording,
  onStopRecording,
  className,
}: VideoCallSessionProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "idle" || status === "ended") {
      setCallDuration(0);
    }
  }, [status]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const quality = qualityConfig[connectionQuality];
  const QualityIcon = quality.icon;

  if (status === "connecting") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-8 bg-background/95 rounded-xl", className)}>
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary/30 animate-pulse flex items-center justify-center">
            <VideoAvatar
              avatarUrl={avatarUrl}
              name={avatarName}
              emotion="neutral"
              className="w-28 h-28"
            />
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">Connecting to {avatarName}...</p>
        <p className="text-sm text-muted-foreground">Setting up video call</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-8 bg-background/95 rounded-xl", className)}>
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">Connection Failed</p>
        <p className="text-sm text-muted-foreground text-center">
          Unable to establish video call. Falling back to voice mode.
        </p>
      </div>
    );
  }

  if (status === "reconnecting") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-8 bg-background/95 rounded-xl", className)}>
        <Wifi className="h-12 w-12 text-yellow-500 animate-pulse" />
        <p className="text-lg font-medium text-foreground">Reconnecting...</p>
        <p className="text-sm text-muted-foreground">Attempting to restore connection</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col bg-black/95 rounded-xl overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <QualityIcon className={cn("h-4 w-4", quality.color)} />
            <span className={cn("text-xs", quality.color)}>{quality.label}</span>
          </div>
          {latencyMs > 0 && (
            <span className="text-xs text-muted-foreground">{latencyMs}ms</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-red-600/20 text-red-400 border-red-600/30">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
            {formatDuration(callDuration)}
          </Badge>
          {avatarName && (
            <span className="text-sm text-white/80">{avatarName}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white h-8 w-8"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
        <div className="w-full h-full flex items-center justify-center p-4">
          <VideoAvatar
            avatarUrl={avatarUrl}
            name={avatarName}
            emotion={emotion}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            isListening={isListening}
            audioAnalyser={ttsAudioAnalyser}
            className="w-full h-full max-w-[400px] max-h-[400px]"
          />
        </div>

        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50 shadow-lg">
          {localStream && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
              <VideoOff className="h-6 w-6 text-white/50" />
            </div>
          )}
          {isMuted && (
            <div className="absolute top-1 right-1 bg-red-500/80 rounded-full p-0.5">
              <MicOff className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>

        {isThinking && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              Thinking...
            </Badge>
          </div>
        )}
        {isSpeaking && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
              Speaking...
            </Badge>
          </div>
        )}
        {isListening && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Listening...
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 py-4 bg-black/60 backdrop-blur-sm">
        {(isRecording || isTranscribing) && (
          <div className="text-xs text-white/70 mb-1">
            {isTranscribing ? "Transcribing..." : "Listening... tap to send"}
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full border-2 transition-all",
              isMuted
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "border-white/30 text-white hover:bg-white/10",
            )}
            onClick={onToggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {onStartRecording && onStopRecording && (
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full border-2 transition-all",
                isRecording
                  ? "bg-green-500/30 border-green-500 text-green-400 hover:bg-green-500/40 animate-pulse"
                  : "border-primary/50 text-primary hover:bg-primary/10",
              )}
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isTranscribing || isSpeaking}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full border-2 transition-all",
              isCameraOff
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "border-white/30 text-white hover:bg-white/10",
            )}
            onClick={onToggleCamera}
          >
            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
