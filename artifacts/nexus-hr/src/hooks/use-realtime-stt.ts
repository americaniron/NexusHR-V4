import { useState, useRef, useCallback, useEffect } from "react";

interface UseRealtimeSTTOptions {
  apiBase?: string;
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseRealtimeSTTReturn {
  isStreaming: boolean;
  isConnecting: boolean;
  partialText: string;
  finalText: string;
  audioLevel: number;
  startStreaming: () => Promise<void>;
  stopStreaming: () => void;
}

const SAMPLE_RATE = 16000;
const WS_ENDPOINT = "wss://api.elevenlabs.io/v1/speech-to-text/realtime";

export function useRealtimeSTT(options: UseRealtimeSTTOptions = {}): UseRealtimeSTTReturn {
  const {
    onPartialTranscript,
    onFinalTranscript,
    onError,
    language = "en",
  } = options;
  const apiBase = options.apiBase || "/api";

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const accumulatedTextRef = useRef("");
  const onPartialRef = useRef(onPartialTranscript);
  const onFinalRef = useRef(onFinalTranscript);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onPartialRef.current = onPartialTranscript;
    onFinalRef.current = onFinalTranscript;
    onErrorRef.current = onError;
  }, [onPartialTranscript, onFinalTranscript, onError]);

  const cleanupMedia = useCallback(() => {
    if (levelIntervalRef.current) {
      clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = undefined;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const cleanup = useCallback(() => {
    cleanupMedia();

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, "User stopped");
      }
      wsRef.current = null;
    }

    setIsStreaming(false);
    setIsConnecting(false);
  }, [cleanupMedia]);

  const stopStreaming = useCallback(() => {
    const ws = wsRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          message_type: "input_audio_chunk",
          audio_base_64: "",
          sample_rate: SAMPLE_RATE,
          commit: true,
        }));
      } catch {
        // ignore send errors during close
      }
    }

    setTimeout(() => {
      const accumulated = accumulatedTextRef.current.trim();
      if (accumulated) {
        setFinalText(accumulated);
        onFinalRef.current?.(accumulated);
      }
      accumulatedTextRef.current = "";
      setPartialText("");
      cleanup();
    }, 300);
  }, [cleanup]);

  const startStreaming = useCallback(async () => {
    if (isStreaming || isConnecting) return;

    setIsConnecting(true);
    setPartialText("");
    setFinalText("");
    accumulatedTextRef.current = "";

    try {
      const tokenResponse = await fetch(`${apiBase}/voice/stt-token`, {
        credentials: "include",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get transcription token");
      }

      const { token } = await tokenResponse.json();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: SAMPLE_RATE,
        },
      });
      streamRef.current = stream;

      const wsUrl = `${WS_ENDPOINT}?token=${token}&model_id=scribe_v2_realtime&language_code=${language}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.message_type === "session_started") {
            setIsConnecting(false);
            setIsStreaming(true);
            startAudioCapture(ws, stream);
          }

          if (msg.message_type === "partial_transcript" && msg.text) {
            const display = accumulatedTextRef.current
              ? `${accumulatedTextRef.current} ${msg.text}`
              : msg.text;
            setPartialText(display);
            onPartialRef.current?.(display);
          }

          if (msg.message_type === "committed_transcript" && msg.text) {
            accumulatedTextRef.current = accumulatedTextRef.current
              ? `${accumulatedTextRef.current} ${msg.text}`
              : msg.text;
            setPartialText(accumulatedTextRef.current);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        onErrorRef.current?.("Real-time transcription connection failed. Retrying with standard mode.");
        cleanupMedia();
        wsRef.current = null;
        setIsStreaming(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        cleanupMedia();

        if (event.code !== 1000) {
          const accumulated = accumulatedTextRef.current.trim();
          if (accumulated) {
            setFinalText(accumulated);
            onFinalRef.current?.(accumulated);
          }
          accumulatedTextRef.current = "";
        }

        wsRef.current = null;
        setIsStreaming(false);
        setIsConnecting(false);
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start real-time transcription";
      onErrorRef.current?.(message);
      cleanup();
    }
  }, [isStreaming, isConnecting, apiBase, language, cleanup, cleanupMedia]);

  const startAudioCapture = useCallback((ws: WebSocket, stream: MediaStream) => {
    const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    levelIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      setAudioLevel(avg / 255);
    }, 100);

    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const float32 = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
      }

      const bytes = new Uint8Array(int16.buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      ws.send(JSON.stringify({
        message_type: "input_audio_chunk",
        audio_base_64: base64,
        sample_rate: SAMPLE_RATE,
        commit: false,
      }));
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isStreaming,
    isConnecting,
    partialText,
    finalText,
    audioLevel,
    startStreaming,
    stopStreaming,
  };
}
