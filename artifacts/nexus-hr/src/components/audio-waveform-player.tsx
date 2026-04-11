import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioWaveformPlayerProps {
  src: string;
  autoPlay?: boolean;
  compact?: boolean;
  className?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
}

const BAR_COUNT = 32;

export function AudioWaveformPlayer({
  src,
  autoPlay = false,
  compact = false,
  className,
  onPlayStateChange,
  onEnded,
}: AudioWaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const setupAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(src);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      onPlayStateChange?.(false);
      onEnded?.();
    });

    audio.addEventListener("error", () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    });

    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserRef.current = analyser;
    } catch {
      // AudioContext not available
    }

    return audio;
  }, [src, onPlayStateChange, onEnded]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = Math.max(2, (width / BAR_COUNT) - 1);
    const gap = 1;

    if (analyser && isPlaying) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      for (let i = 0; i < BAR_COUNT; i++) {
        const dataIndex = Math.floor((i / BAR_COUNT) * dataArray.length);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(2, value * height * 0.9);

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const playedRatio = progress;
        const barRatio = i / BAR_COUNT;

        if (barRatio <= playedRatio) {
          ctx.fillStyle = "hsl(30, 72%, 50%)";
        } else {
          ctx.fillStyle = "hsl(220, 10%, 35%)";
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1);
        ctx.fill();
      }
    } else {
      for (let i = 0; i < BAR_COUNT; i++) {
        const baseHeight = Math.sin(i * 0.5) * 0.3 + 0.4;
        const barHeight = Math.max(2, baseHeight * height * 0.5);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const playedRatio = progress;
        const barRatio = i / BAR_COUNT;

        if (barRatio <= playedRatio) {
          ctx.fillStyle = "hsl(30, 72%, 50%)";
        } else {
          ctx.fillStyle = "hsl(220, 10%, 25%)";
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1);
        ctx.fill();
      }
    }

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isPlaying, progress]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  useEffect(() => {
    drawWaveform();
  }, [progress, drawWaveform]);

  useEffect(() => {
    if (autoPlay && src) {
      const audio = setupAudio();
      audio.play().then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }).catch(() => {});
    }
  }, [autoPlay, src, setupAudio, onPlayStateChange]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    const audio = setupAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
    setProgress(ratio);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <button
          onClick={togglePlay}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-white/10 transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        {isPlaying && (
          <div className="flex items-end gap-[1px] h-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-[2px] bg-primary rounded-full animate-waveform-bar"
                style={{ animationDelay: `${i * 0.15}s`, height: 12 }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <canvas
          ref={canvasRef}
          width={256}
          height={32}
          className="w-full h-8 cursor-pointer rounded"
          onClick={handleSeek}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-right">
          {formatTime(progress * duration)} / {formatTime(duration)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
