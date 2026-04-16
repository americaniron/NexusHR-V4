import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Send, MessageCircle, X, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL;
const API_BASE = `${BASE}api`.replace(/\/\//g, "/");
const ADMIN_NAME = "Aria Lawson";
const ADMIN_TITLE = "Admin & Onboarding Director";
const ADMIN_AVATAR = `${BASE}admin-aria-avatar.png`;
const ADMIN_VIDEO = `${BASE}admin-aria-intro.mp4`;
const ADMIN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

interface AIAssistantProps {
  messages: string[];
  stepTitle: string;
  context?: {
    orgName?: string;
    industry?: string;
    selectedRole?: string;
    employeeName?: string;
  };
}

async function synthesizeVoice(
  text: string,
  token: string | null,
): Promise<HTMLAudioElement | null> {
  try {
    const response = await fetch(`${API_BASE}/voice/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({
        text,
        voiceId: ADMIN_VOICE_ID,
        roleTitle: ADMIN_TITLE,
        personality: { energy: 0.6, formality: 0.7, warmth: 0.8 },
      }),
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    return audio;
  } catch {
    return null;
  }
}

export function AIAssistant({ messages, stepTitle, context }: AIAssistantProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [caption, setCaption] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isVideoStep, setIsVideoStep] = useState(stepTitle === "welcome");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepIdRef = useRef(stepTitle);
  const audioEnabledRef = useRef(audioEnabled);
  const { getToken } = useAuth();

  audioEnabledRef.current = audioEnabled;
  stepIdRef.current = stepTitle;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, forStep: string) => {
    setCaption(text);
    if (!audioEnabledRef.current) return;

    const token = await getToken();
    if (stepIdRef.current !== forStep) return;

    const audio = await synthesizeVoice(text, token);
    if (!audio || stepIdRef.current !== forStep) return;

    audioRef.current = audio;
    setIsSpeaking(true);

    audio.onended = () => {
      audioRef.current = null;
      setIsSpeaking(false);
    };
    audio.onerror = () => {
      audioRef.current = null;
      setIsSpeaking(false);
    };

    audio.play().catch(() => {
      setIsSpeaking(false);
    });
  }, [getToken]);

  useEffect(() => {
    stopAudio();
    setCaption("");
    setShowChat(false);
    setIsVideoStep(stepTitle === "welcome");

    if (stepTitle === "welcome") {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      return;
    }

    const combined = messages.join(" ");
    if (!combined) return;

    const timer = setTimeout(() => {
      speak(combined, stepTitle);
    }, 500);

    return () => clearTimeout(timer);
  }, [stepTitle]);

  const handleVideoStarted = () => {
    setIsSpeaking(true);
  };

  const handleVideoEnded = () => {
    setIsSpeaking(false);
    setIsVideoStep(false);
    const combined = messages.join(" ");
    if (combined) {
      speak(combined, stepTitle);
    }
  };

  const toggleAudio = useCallback(() => {
    if (audioEnabled) {
      stopAudio();
    }
    setAudioEnabled((prev) => !prev);
  }, [audioEnabled, stopAudio]);

  const handleAskAria = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatLoading(true);
    stopAudio();

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/aria/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ question, stepId: stepTitle, context }),
      });

      if (!response.ok) {
        setCaption("I'm sorry, I couldn't process that right now. Could you try again?");
        setChatLoading(false);
        return;
      }

      const data = await response.json();
      const ariaResponse = data.response || "Let me look into that for you.";

      setShowChat(false);
      speak(ariaResponse, stepTitle);
    } catch {
      setCaption("I'm having a moment — please try asking again.");
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, stepTitle, context, getToken, stopAudio, speak]);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="relative bg-black aspect-video overflow-hidden">
        {isVideoStep ? (
          <video
            ref={videoRef}
            src={ADMIN_VIDEO}
            className="w-full h-full object-cover"
            muted
            playsInline
            onPlaying={handleVideoStarted}
            onEnded={handleVideoEnded}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
            <div className="relative">
              <div
                className={`transition-all duration-500 ${
                  isSpeaking ? "scale-105" : "scale-100"
                }`}
              >
                <img
                  src={ADMIN_AVATAR}
                  alt={ADMIN_NAME}
                  className={`w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 ${
                    isSpeaking
                      ? "border-primary shadow-[0_0_30px_rgba(var(--primary-rgb,200,120,50),0.4)]"
                      : "border-white/20 shadow-lg"
                  }`}
                />
              </div>

              {isSpeaking && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-primary rounded-full animate-waveform-bar"
                      style={{
                        animationDelay: `${i * 0.08}s`,
                        height: 14,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isSpeaking ? "bg-green-500 animate-pulse" : "bg-green-500/60"
                }`}
              />
              <span className="text-xs text-white/70 font-medium">LIVE</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-sm font-semibold">{ADMIN_NAME}</span>
            <span className="text-white/50 text-xs">{ADMIN_TITLE}</span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            title={audioEnabled ? "Mute Aria" : "Unmute Aria"}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4 text-white" />
            ) : (
              <VolumeX className="h-4 w-4 text-white/50" />
            )}
          </button>
        </div>
      </div>

      {caption && (
        <div className="px-4 py-3 border-b border-primary/10 bg-card/50">
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            &ldquo;{caption}&rdquo;
          </p>
        </div>
      )}

      <div className="px-4 py-3">
        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-sm text-primary font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            Ask Aria a Question
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Ask Aria anything about this step
              </span>
              <button
                onClick={() => setShowChat(false)}
                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAria()}
                placeholder="Type your question..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={chatLoading}
                autoFocus
              />
              <button
                onClick={handleAskAria}
                disabled={chatLoading || !chatInput.trim()}
                className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {chatLoading ? (
                  <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
