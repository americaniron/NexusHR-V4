import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { AIAvatar } from "@/components/ai-avatar";
import type { AvatarVisualState } from "@/components/ai-avatar";
import { useAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL;
const ADMIN_NAME = "Aria Lawson";
const ADMIN_TITLE = "Admin & Onboarding Director";
const ADMIN_AVATAR = `${BASE}admin-aria-avatar.png`;
const ADMIN_VIDEO = `${BASE}admin-aria-intro.mp4`;
const ADMIN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

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

  return <>{displayed}<span className="animate-pulse text-primary">|</span></>;
}

export function AIAssistant({ messages, stepTitle }: AIAssistantProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [typingDone, setTypingDone] = useState<Set<number>>(new Set());
  const [avatarState, setAvatarState] = useState<AvatarVisualState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const { getToken } = useAuth();

  useEffect(() => {
    setVisibleCount(1);
    setTypingDone(new Set());
  }, [stepTitle]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, typingDone]);

  useEffect(() => {
    if (stepTitle === "welcome" && !hasPlayedIntro) {
      setShowVideo(true);
      setHasPlayedIntro(true);
    } else {
      setShowVideo(false);
    }
  }, [stepTitle, hasPlayedIntro]);

  const speakText = useCallback(async (text: string) => {
    if (!audioEnabled) return;

    try {
      const token = await getToken();
      const response = await fetch(`${BASE}api/voice/synthesize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          text,
          voiceId: ADMIN_VOICE_ID,
          roleTitle: ADMIN_TITLE,
          personality: { energy: 0.6, formality: 0.7, warmth: 0.8 },
        }),
      });

      if (!response.ok) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      setIsSpeaking(true);
      setAvatarState("speaking");
      isSpeakingRef.current = true;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsSpeaking(false);
        setAvatarState("idle");
        isSpeakingRef.current = false;
        processNextInQueue();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setIsSpeaking(false);
        setAvatarState("idle");
        isSpeakingRef.current = false;
        processNextInQueue();
      };

      await audio.play();
    } catch {
      setIsSpeaking(false);
      setAvatarState("idle");
      isSpeakingRef.current = false;
      processNextInQueue();
    }
  }, [audioEnabled, getToken]);

  const processNextInQueue = useCallback(() => {
    if (speakQueueRef.current.length > 0) {
      const next = speakQueueRef.current.shift()!;
      speakText(next);
    }
  }, [speakText]);

  const queueSpeak = useCallback((text: string) => {
    if (!audioEnabled) return;
    if (isSpeakingRef.current) {
      speakQueueRef.current.push(text);
    } else {
      speakText(text);
    }
  }, [audioEnabled, speakText]);

  const handleTypingComplete = useCallback((idx: number) => {
    setTypingDone((prev) => new Set(prev).add(idx));

    queueSpeak(messages[idx]);

    if (idx < messages.length - 1) {
      setTimeout(() => setVisibleCount((prev) => Math.min(prev + 1, messages.length)), 400);
    }
  }, [messages, queueSpeak]);

  const toggleAudio = useCallback(() => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      speakQueueRef.current = [];
      setIsSpeaking(false);
      setAvatarState("idle");
      isSpeakingRef.current = false;
    }
    setAudioEnabled(prev => !prev);
  }, [audioEnabled]);

  const toggleVideo = useCallback(() => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  }, [videoPlaying]);

  const handleVideoPlay = () => setVideoPlaying(true);
  const handleVideoPause = () => setVideoPlaying(false);
  const handleVideoEnd = () => {
    setVideoPlaying(false);
    setShowVideo(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-primary/5">
        <div className="relative">
          <AIAvatar
            src={ADMIN_AVATAR}
            name={ADMIN_NAME}
            roleTitle={ADMIN_TITLE}
            size="md"
            visualState={avatarState}
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{ADMIN_NAME}</span>
            {isSpeaking && (
              <div className="flex items-center gap-0.5">
                <div className="h-2 w-0.5 bg-primary rounded-full animate-pulse" />
                <div className="h-3 w-0.5 bg-primary rounded-full animate-pulse [animation-delay:150ms]" />
                <div className="h-1.5 w-0.5 bg-primary rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">{ADMIN_TITLE}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAudio}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
            title={audioEnabled ? "Mute voice" : "Enable voice"}
          >
            {audioEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-primary" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {showVideo && (
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={ADMIN_VIDEO}
            className="w-full aspect-video object-cover"
            autoPlay
            muted
            playsInline
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoEnd}
          />
          <button
            onClick={toggleVideo}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            {videoPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </button>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">{ADMIN_NAME}</span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div key={`${stepTitle}-${i}`} className="flex gap-2.5">
            <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5 ring-1 ring-primary/20">
              <img src={ADMIN_AVATAR} alt={ADMIN_NAME} className="h-full w-full object-cover" />
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
