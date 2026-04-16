import { useState, useRef, useCallback, useEffect } from "react";
import type { AvatarVisualState, EmotionState } from "@/components/ai-avatar";
import { useRealtimeSTT } from "./use-realtime-stt";

export interface VisemeData {
  viseme: string;
  startMs: number;
  durationMs: number;
}

interface UseVoiceModeOptions {
  onTranscription?: (text: string) => void;
  onPartialTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onEmotionChange?: (emotion: EmotionState) => void;
  onVisemesReady?: (visemes: VisemeData[]) => void;
  onBargeIn?: () => void;
  enableBargeIn?: boolean;
  bargeInThreshold?: number;
  apiBase?: string;
}

interface UseVoiceModeReturn {
  isVoiceMode: boolean;
  toggleVoiceMode: () => Promise<void>;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  isTranscribing: boolean;
  isSynthesizing: boolean;
  isPlayingAudio: boolean;
  isBargedIn: boolean;
  avatarState: AvatarVisualState;
  audioLevel: number;
  currentEmotion: EmotionState;
  currentVisemes: VisemeData[];
  partialTranscript: string;
  synthesizeAndPlay: (text: string, voiceId?: string, personality?: { energy?: number; formality?: number; warmth?: number }) => Promise<void>;
  stopAudio: () => void;
  micPermissionGranted: boolean;
  requestMicPermission: () => Promise<boolean>;
}

export function useVoiceMode(options: UseVoiceModeOptions = {}): UseVoiceModeReturn {
  const {
    onTranscription, onPartialTranscript, onError, onEmotionChange, onVisemesReady, onBargeIn,
    enableBargeIn = true,
    bargeInThreshold = 0.15,
  } = options;
  const apiBase = options.apiBase || "/api";

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBargedIn, setIsBargedIn] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>("neutral");
  const [currentVisemes, setCurrentVisemes] = useState<VisemeData[]>([]);

  const bargeInStreamRef = useRef<MediaStream | null>(null);
  const bargeInContextRef = useRef<AudioContext | null>(null);
  const bargeInIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const pendingTranscriptRef = useRef<string | null>(null);
  const stopResolverRef = useRef<((text: string | null) => void) | null>(null);

  const realtimeSTT = useRealtimeSTT({
    apiBase,
    language: "en",
    onPartialTranscript: (text) => {
      onPartialTranscript?.(text);
    },
    onFinalTranscript: (text) => {
      if (text.trim()) {
        pendingTranscriptRef.current = text;
        onTranscription?.(text);
        if (stopResolverRef.current) {
          stopResolverRef.current(text);
          stopResolverRef.current = null;
        }
      }
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const avatarState: AvatarVisualState = isPlayingAudio
    ? "speaking"
    : isTranscribing || isSynthesizing
    ? "thinking"
    : isRecording
    ? "listening"
    : "idle";

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermissionGranted(true);
      return true;
    } catch {
      setMicPermissionGranted(false);
      onError?.("Microphone access denied. Please allow microphone access in your browser settings.");
      return false;
    }
  }, [onError]);

  const toggleVoiceMode = useCallback(async () => {
    if (isVoiceMode) {
      realtimeSTT.stopStreaming();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setIsRecording(false);
      setIsTranscribing(false);
      setIsSynthesizing(false);
      setIsPlayingAudio(false);
      setIsVoiceMode(false);
    } else {
      const granted = await requestMicPermission();
      if (granted) {
        setIsVoiceMode(true);
      }
    }
  }, [isVoiceMode, requestMicPermission, realtimeSTT]);

  const startRecording = useCallback(async () => {
    pendingTranscriptRef.current = null;
    setMicPermissionGranted(true);
    setIsRecording(true);
    try {
      await realtimeSTT.startStreaming();
    } catch {
      onError?.("Failed to start recording. Please check your microphone.");
      setIsRecording(false);
    }
  }, [onError, realtimeSTT]);

  useEffect(() => {
    if (isRecording && !realtimeSTT.isStreaming && !realtimeSTT.isConnecting) {
      setIsRecording(false);
    }
  }, [isRecording, realtimeSTT.isStreaming, realtimeSTT.isConnecting]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    setIsRecording(false);

    if (realtimeSTT.isStreaming || realtimeSTT.isConnecting) {
      realtimeSTT.stopStreaming();
    }

    if (pendingTranscriptRef.current) {
      const text = pendingTranscriptRef.current;
      pendingTranscriptRef.current = null;
      return text;
    }

    return new Promise((resolve) => {
      stopResolverRef.current = resolve;
      setTimeout(() => {
        if (stopResolverRef.current) {
          stopResolverRef.current(null);
          stopResolverRef.current = null;
        }
      }, 500);
    });
  }, [realtimeSTT]);

  const synthesizeAndPlay = useCallback(async (
    text: string,
    voiceId?: string,
    personality?: { energy?: number; formality?: number; warmth?: number }
  ) => {
    setIsSynthesizing(true);
    try {
      const body: Record<string, unknown> = { text };
      if (voiceId) body.voiceId = voiceId;
      if (personality) body.personality = personality;

      const alignedResponse = await fetch(`${apiBase}/voice/synthesize-aligned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (alignedResponse.ok) {
        const data = await alignedResponse.json();

        if (data.emotion) {
          const emotion = data.emotion as EmotionState;
          setCurrentEmotion(emotion);
          onEmotionChange?.(emotion);
        }

        if (data.visemes && Array.isArray(data.visemes)) {
          setCurrentVisemes(data.visemes);
          onVisemesReady?.(data.visemes);
        }

        if (data.audio) {
          setIsSynthesizing(false);
          setIsPlayingAudio(true);

          const audioSrc = data.audio.startsWith("data:")
            ? data.audio
            : `data:audio/mpeg;base64,${data.audio}`;
          const audio = new Audio(audioSrc);
          audioPlayerRef.current = audio;

          await new Promise<void>((resolvePlayback) => {
            audio.onended = () => {
              setIsPlayingAudio(false);
              setCurrentVisemes([]);
              audioPlayerRef.current = null;
              resolvePlayback();
            };
            audio.onerror = () => {
              setIsPlayingAudio(false);
              setCurrentVisemes([]);
              audioPlayerRef.current = null;
              resolvePlayback();
            };
            audio.play().catch(() => resolvePlayback());
          });
          return;
        }
      }

      const response = await fetch(`${apiBase}/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Voice synthesis failed");
      }

      if (!response.body) {
        throw new Error("No stream body in response");
      }

      const supportsMediaSource = typeof MediaSource !== "undefined"
        && MediaSource.isTypeSupported("audio/mpeg");

      await new Promise<void>((resolvePlayback, rejectPlayback) => {
        if (supportsMediaSource) {
          const mediaSource = new MediaSource();
          const audioUrl = URL.createObjectURL(mediaSource);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          const cleanupPlayback = () => {
            setIsPlayingAudio(false);
            setCurrentVisemes([]);
            URL.revokeObjectURL(audioUrl);
            audioPlayerRef.current = null;
            resolvePlayback();
          };

          audio.onended = cleanupPlayback;
          audio.onerror = () => {
            cleanupPlayback();
            rejectPlayback(new Error("Audio playback error"));
          };

          mediaSource.addEventListener("sourceopen", async () => {
            try {
              const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
              const reader = response.body!.getReader();
              let firstChunk = true;

              const endStream = () => {
                if (mediaSource.readyState === "open") {
                  if (sourceBuffer.updating) {
                    sourceBuffer.addEventListener("updateend", () => {
                      if (mediaSource.readyState === "open") {
                        mediaSource.endOfStream();
                      }
                    }, { once: true });
                  } else {
                    mediaSource.endOfStream();
                  }
                }
              };

              const pump = async (): Promise<void> => {
                const { done, value } = await reader.read();
                if (done) {
                  endStream();
                  return;
                }

                if (sourceBuffer.updating) {
                  await new Promise<void>(r => {
                    sourceBuffer.addEventListener("updateend", () => r(), { once: true });
                  });
                }

                sourceBuffer.appendBuffer(value);
                await new Promise<void>(r => {
                  sourceBuffer.addEventListener("updateend", () => r(), { once: true });
                });

                if (firstChunk) {
                  firstChunk = false;
                  setIsSynthesizing(false);
                  setIsPlayingAudio(true);
                  audio.play().catch(() => {});
                }

                await pump();
              };

              const playbackTimeout = setTimeout(() => {
                if (audioPlayerRef.current === audio) {
                  cleanupPlayback();
                }
              }, 120_000);

              audio.addEventListener("ended", () => clearTimeout(playbackTimeout), { once: true });

              await pump();
            } catch (err) {
              rejectPlayback(err instanceof Error ? err : new Error(String(err)));
            }
          }, { once: true });
        } else {
          (async () => {
            try {
              const chunks: Uint8Array[] = [];
              const reader = response.body!.getReader();
              let receivedFirstChunk = false;

              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                if (!receivedFirstChunk) {
                  receivedFirstChunk = true;
                  setIsSynthesizing(false);
                  setIsPlayingAudio(true);
                }
              }

              const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
              const audioUrl = URL.createObjectURL(blob);
              const audio = new Audio(audioUrl);
              audioPlayerRef.current = audio;

              audio.onended = () => {
                setIsPlayingAudio(false);
                setCurrentVisemes([]);
                URL.revokeObjectURL(audioUrl);
                audioPlayerRef.current = null;
                resolvePlayback();
              };

              audio.onerror = () => {
                setIsPlayingAudio(false);
                setCurrentVisemes([]);
                URL.revokeObjectURL(audioUrl);
                audioPlayerRef.current = null;
                rejectPlayback(new Error("Audio playback error"));
              };

              await audio.play();
            } catch (err) {
              rejectPlayback(err instanceof Error ? err : new Error(String(err)));
            }
          })();
        }
      });
    } catch {
      setIsSynthesizing(false);
      setIsPlayingAudio(false);
      onError?.("Failed to synthesize voice. Please try again.");
    }
  }, [apiBase, onError, onEmotionChange, onVisemesReady]);

  const stopBargeInMonitor = useCallback(() => {
    if (bargeInIntervalRef.current) {
      clearInterval(bargeInIntervalRef.current);
      bargeInIntervalRef.current = undefined;
    }
    if (bargeInContextRef.current) {
      bargeInContextRef.current.close().catch(() => {});
      bargeInContextRef.current = null;
    }
    if (bargeInStreamRef.current) {
      bargeInStreamRef.current.getTracks().forEach(t => t.stop());
      bargeInStreamRef.current = null;
    }
  }, []);

  const startBargeInMonitor = useCallback(async () => {
    if (!enableBargeIn || !isVoiceMode) return;
    stopBargeInMonitor();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      bargeInStreamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      bargeInContextRef.current = ctx;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let consecutiveAboveThreshold = 0;

      bargeInIntervalRef.current = setInterval(() => {
        if (!audioPlayerRef.current || audioPlayerRef.current.paused) {
          stopBargeInMonitor();
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const normalized = avg / 255;

        if (normalized > bargeInThreshold) {
          consecutiveAboveThreshold++;
          if (consecutiveAboveThreshold >= 2) {
            if (audioPlayerRef.current) {
              const audio = audioPlayerRef.current;
              const fadeInterval = setInterval(() => {
                if (audio.volume > 0.05) {
                  audio.volume = Math.max(0, audio.volume - 0.15);
                } else {
                  clearInterval(fadeInterval);
                  audio.pause();
                  audioPlayerRef.current = null;
                  setIsPlayingAudio(false);
                  setCurrentVisemes([]);
                  setIsBargedIn(true);
                  onBargeIn?.();
                  setTimeout(() => setIsBargedIn(false), 2000);
                }
              }, 30);
            }
            stopBargeInMonitor();
          }
        } else {
          consecutiveAboveThreshold = 0;
        }
      }, 100);
    } catch {
      // barge-in is optional
    }
  }, [enableBargeIn, isVoiceMode, bargeInThreshold, onBargeIn, stopBargeInMonitor]);

  useEffect(() => {
    if (isPlayingAudio && isVoiceMode && enableBargeIn) {
      startBargeInMonitor();
    } else {
      stopBargeInMonitor();
    }
  }, [isPlayingAudio, isVoiceMode, enableBargeIn, startBargeInMonitor, stopBargeInMonitor]);

  const stopAudio = useCallback(() => {
    stopBargeInMonitor();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
      setIsPlayingAudio(false);
      setCurrentVisemes([]);
    }
  }, [stopBargeInMonitor]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (bargeInIntervalRef.current) {
        clearInterval(bargeInIntervalRef.current);
      }
      if (bargeInContextRef.current) {
        bargeInContextRef.current.close().catch(() => {});
      }
      if (bargeInStreamRef.current) {
        bargeInStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    isVoiceMode,
    toggleVoiceMode,
    isRecording,
    startRecording,
    stopRecording,
    isTranscribing: realtimeSTT.isConnecting,
    isSynthesizing,
    isPlayingAudio,
    isBargedIn,
    avatarState,
    audioLevel: realtimeSTT.isStreaming ? realtimeSTT.audioLevel : 0,
    currentEmotion,
    currentVisemes,
    partialTranscript: realtimeSTT.partialText,
    synthesizeAndPlay,
    stopAudio,
    micPermissionGranted,
    requestMicPermission,
  };
}
