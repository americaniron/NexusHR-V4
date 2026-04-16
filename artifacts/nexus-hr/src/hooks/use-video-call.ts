import { useState, useRef, useCallback, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { EmotionState } from "@/components/ai-avatar";

export type VideoCallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed"
  | "ended";

interface UseVideoCallOptions {
  conversationId: number;
  employeeId?: number;
  getToken: () => Promise<string | null>;
  onTranscription?: (text: string) => void;
  onStatusChange?: (status: VideoCallStatus) => void;
  onError?: (error: string) => void;
  onFallbackToVoice?: () => void;
  apiBase?: string;
}

interface UseVideoCallReturn {
  status: VideoCallStatus;
  sessionId: string | null;
  localStream: MediaStream | null;
  audioAnalyser: AnalyserNode | null;
  ttsAudioAnalyser: AnalyserNode | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  connectionQuality: "good" | "fair" | "poor";
  latencyMs: number;
  sendTtsAudio: (audioData: string) => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  isTranscribing: boolean;
  isTtsSpeaking: boolean;
}

export function useVideoCall(options: UseVideoCallOptions): UseVideoCallReturn {
  const {
    conversationId,
    employeeId,
    getToken,
    onTranscription,
    onStatusChange,
    onError,
    onFallbackToVoice,
  } = options;
  const apiBase = options.apiBase || "/api";

  const [status, setStatus] = useState<VideoCallStatus>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "fair" | "poor">("good");
  const [latencyMs, setLatencyMs] = useState(0);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [ttsAudioAnalyser, setTtsAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ttsAudioContextRef = useRef<AudioContext | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const latencyCheckRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const statusRef = useRef<VideoCallStatus>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  const updateStatus = useCallback((newStatus: VideoCallStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const cleanup = useCallback(() => {
    if (latencyCheckRef.current) {
      clearInterval(latencyCheckRef.current);
      latencyCheckRef.current = undefined;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setLocalStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      setAudioAnalyser(null);
    }

    if (ttsSourceRef.current) {
      try { ttsSourceRef.current.stop(); } catch {}
      ttsSourceRef.current = null;
    }

    if (ttsAudioContextRef.current) {
      ttsAudioContextRef.current.close().catch(() => {});
      ttsAudioContextRef.current = null;
      ttsAnalyserRef.current = null;
      setTtsAudioAnalyser(null);
    }

    if (socketRef.current) {
      const sid = sessionIdRef.current;
      if (sid) {
        socketRef.current.emit("video-call:leave", sid);
      }
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSessionId(null);
    sessionIdRef.current = null;
    setIsRecording(false);
    setIsTranscribing(false);
    setIsTtsSpeaking(false);
    reconnectAttempts.current = 0;
  }, []);

  const createPeerConnection = useCallback((iceServers: RTCIceServer[], socket: Socket, sessionId: string) => {
    const pc = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("video-call:ice-candidate", {
          sessionId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        if (statusRef.current === "connected") {
          updateStatus("reconnecting");
        }
      } else if (pc.iceConnectionState === "connected") {
        if (statusRef.current === "reconnecting") {
          updateStatus("connected");
        }
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(() => {});
      }
    };

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    return pc;
  }, [updateStatus]);

  const startCall = useCallback(async () => {
    try {
      updateStatus("connecting");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
        } catch {
          onError?.("Camera and microphone access denied. Please allow access to use video calls.");
          updateStatus("failed");
          onFallbackToVoice?.();
          return;
        }
      }

      streamRef.current = stream;
      setLocalStream(stream);

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      setAudioAnalyser(analyser);

      const ttsCtx = new AudioContext();
      const ttsAnalyser = ttsCtx.createAnalyser();
      ttsAnalyser.fftSize = 256;
      ttsAnalyser.smoothingTimeConstant = 0.3;
      ttsAudioContextRef.current = ttsCtx;
      ttsAnalyserRef.current = ttsAnalyser;
      setTtsAudioAnalyser(ttsAnalyser);

      const response = await fetch(`${apiBase}/video-call/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId, employeeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create video call session");
      }

      const session = await response.json();
      setSessionId(session.sessionId);
      sessionIdRef.current = session.sessionId;

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const socket = io(baseUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      const pc = createPeerConnection(
        session.iceServers || [{ urls: "stun:stun.l.google.com:19302" }],
        socket,
        session.sessionId,
      );

      socket.on("connect", async () => {
        socket.emit("video-call:join", session.sessionId);
        updateStatus("connected");
        reconnectAttempts.current = 0;

        if (latencyCheckRef.current) {
          clearInterval(latencyCheckRef.current);
        }
        latencyCheckRef.current = setInterval(() => {
          socket.volatile.emit("video-call:ping", { sessionId: session.sessionId, ts: Date.now() });
        }, 5000);

        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit("video-call:offer", {
            sessionId: session.sessionId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.warn("[VideoCall] Failed to create/send SDP offer:", err);
          onError?.("Failed to negotiate WebRTC connection");
        }
      });

      socket.on("video-call:pong", (payload: { ts: number }) => {
        if (payload?.ts) {
          setLatencyMs(Date.now() - payload.ts);
        }
      });

      socket.on("video-call:answer", async (payload: { sdp: RTCSessionDescriptionInit }) => {
        try {
          if (pc.signalingState !== "closed" && payload.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        } catch (err) {
          console.warn("[VideoCall] Failed to set remote description (answer):", err);
        }
      });

      socket.on("video-call:offer", async (payload: { sdp: RTCSessionDescriptionInit }) => {
        try {
          if (pc.signalingState !== "closed" && payload.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("video-call:answer", {
              sessionId: session.sessionId,
              sdp: pc.localDescription,
            });
          }
        } catch (err) {
          console.warn("[VideoCall] Failed to handle incoming offer:", err);
        }
      });

      socket.on("video-call:ice-candidate", async (payload: { candidate: RTCIceCandidateInit }) => {
        try {
          if (pc.signalingState !== "closed" && payload.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
        } catch (err) {
          console.warn("[VideoCall] Failed to add ICE candidate:", err);
        }
      });

      socket.on("video-call:error", (payload: { message: string }) => {
        console.error("[VideoCall] Server error:", payload?.message);
        onError?.(payload?.message || "Video call session error");
        updateStatus("failed");
        onFallbackToVoice?.();
        cleanup();
      });

      socket.on("disconnect", () => {
        if (latencyCheckRef.current) {
          clearInterval(latencyCheckRef.current);
          latencyCheckRef.current = undefined;
        }
        if (statusRef.current !== "ended") {
          reconnectAttempts.current++;
          if (reconnectAttempts.current > maxReconnectAttempts) {
            updateStatus("failed");
            onError?.("Connection lost. Falling back to voice mode.");
            onFallbackToVoice?.();
            cleanup();
          } else {
            updateStatus("reconnecting");
          }
        }
      });

      socket.on("connect_error", async () => {
        const freshToken = await getToken();
        if (freshToken && socket.auth) {
          (socket.auth as Record<string, string>).token = freshToken;
        }
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start video call";
      onError?.(message);
      updateStatus("failed");
      onFallbackToVoice?.();
      cleanup();
    }
  }, [conversationId, employeeId, getToken, apiBase, onError, onFallbackToVoice, updateStatus, cleanup, createPeerConnection]);

  const endCall = useCallback(() => {
    updateStatus("ended");
    cleanup();
  }, [updateStatus, cleanup]);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(!audioTracks[0]?.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsCameraOff(!videoTracks[0]?.enabled);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }, []);

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

  const sendTtsAudio = useCallback((audioBase64: string) => {
    if (!ttsAudioContextRef.current || !ttsAnalyserRef.current) return;

    const ctx = ttsAudioContextRef.current;
    const analyser = ttsAnalyserRef.current;

    if (ttsSourceRef.current) {
      try { ttsSourceRef.current.stop(); } catch {}
      ttsSourceRef.current = null;
    }

    const raw = atob(audioBase64.replace(/^data:audio\/[^;]+;base64,/, ""));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    ctx.decodeAudioData(bytes.buffer.slice(0)).then((buffer) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ttsSourceRef.current = source;
      setIsTtsSpeaking(true);

      source.onended = () => {
        setIsTtsSpeaking(false);
        ttsSourceRef.current = null;
      };

      source.start(0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (ttsSourceRef.current) {
        try { ttsSourceRef.current.stop(); } catch {}
      }
      if (ttsAudioContextRef.current) {
        ttsAudioContextRef.current.close().catch(() => {});
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
      if (latencyCheckRef.current) {
        clearInterval(latencyCheckRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (latencyMs > 2000) {
      setConnectionQuality("poor");
    } else if (latencyMs > 800) {
      setConnectionQuality("fair");
    } else {
      setConnectionQuality("good");
    }
  }, [latencyMs]);

  return {
    status,
    sessionId,
    localStream,
    audioAnalyser,
    ttsAudioAnalyser,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    isMuted,
    isCameraOff,
    connectionQuality,
    latencyMs,
    sendTtsAudio,
    isRecording,
    startRecording,
    stopRecording,
    isTranscribing,
    isTtsSpeaking,
  };
}
