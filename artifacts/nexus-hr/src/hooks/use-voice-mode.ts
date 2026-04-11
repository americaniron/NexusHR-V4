import { useState, useRef, useCallback, useEffect } from "react";
import type { AvatarVisualState } from "@/components/ai-avatar";

interface UseVoiceModeOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  apiBase?: string;
}

interface UseVoiceModeReturn {
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  isTranscribing: boolean;
  isSynthesizing: boolean;
  isPlayingAudio: boolean;
  avatarState: AvatarVisualState;
  audioLevel: number;
  synthesizeAndPlay: (text: string, voiceId?: string, personality?: { energy?: number; formality?: number; warmth?: number }) => Promise<void>;
  stopAudio: () => void;
  micPermissionGranted: boolean;
  requestMicPermission: () => Promise<boolean>;
}

export function useVoiceMode(options: UseVoiceModeOptions = {}): UseVoiceModeReturn {
  const { onTranscription, onError } = options;
  const apiBase = options.apiBase || "/api";

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const levelIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

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

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceMode(prev => {
      if (prev) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        if (levelIntervalRef.current) {
          clearInterval(levelIntervalRef.current);
        }
        setIsRecording(false);
        setIsPlayingAudio(false);
        setAudioLevel(0);
      } else {
        requestMicPermission();
      }
      return !prev;
    });
  }, [requestMicPermission]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      levelIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        setAudioLevel(avg / 255);
      }, 100);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setMicPermissionGranted(true);
    } catch {
      onError?.("Failed to start recording. Please check your microphone.");
    }
  }, [onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        setIsRecording(false);

        if (levelIntervalRef.current) {
          clearInterval(levelIntervalRef.current);
        }
        setAudioLevel(0);

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        if (audioBlob.size < 100) {
          resolve(null);
          return;
        }

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((res) => {
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(audioBlob);
          });
          const base64 = await base64Promise;

          const response = await fetch(`${apiBase}/voice/transcribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ audio: base64 }),
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          const text = data.text || "";
          onTranscription?.(text);
          resolve(text);
        } catch {
          onError?.("Failed to transcribe audio. Please try again.");
          resolve(null);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.stop();
    });
  }, [apiBase, onTranscription, onError]);

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

      const response = await fetch(`${apiBase}/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Voice synthesis failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setIsSynthesizing(false);
      setIsPlayingAudio(true);

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        audioPlayerRef.current = null;
      };

      await audio.play();
    } catch {
      setIsSynthesizing(false);
      setIsPlayingAudio(false);
      onError?.("Failed to synthesize voice. Please try again.");
    }
  }, [apiBase, onError]);

  const stopAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (levelIntervalRef.current) {
        clearInterval(levelIntervalRef.current);
      }
    };
  }, []);

  return {
    isVoiceMode,
    toggleVoiceMode,
    isRecording,
    startRecording,
    stopRecording,
    isTranscribing,
    isSynthesizing,
    isPlayingAudio,
    avatarState,
    audioLevel,
    synthesizeAndPlay,
    stopAudio,
    micPermissionGranted,
    requestMicPermission,
  };
}
