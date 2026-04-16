import { useState, useRef, useCallback, useEffect } from "react";
import type { EmotionState } from "@/components/ai-avatar";

export type AvatarAnimationStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "unavailable";

interface UseAvatarAnimationOptions {
  videoCallSessionId: string | null;
  avatarUrl?: string | null;
  emotion?: EmotionState;
  apiBase?: string;
  onFallback?: () => void;
}

interface UseAvatarAnimationReturn {
  status: AvatarAnimationStatus;
  remoteStream: MediaStream | null;
  provider: string | null;
  startStream: () => Promise<void>;
  stopStream: () => Promise<void>;
  sendAudio: (audioBase64: string, emotion?: EmotionState) => Promise<void>;
  isPhotorealistic: boolean;
}

export function useAvatarAnimation(options: UseAvatarAnimationOptions): UseAvatarAnimationReturn {
  const { videoCallSessionId, avatarUrl, apiBase = "/api", onFallback } = options;

  const [status, setStatus] = useState<AvatarAnimationStatus>("idle");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const statusRef = useRef<AvatarAnimationStatus>("idle");

  const updateStatus = useCallback((newStatus: AvatarAnimationStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  const startStream = useCallback(async () => {
    if (!videoCallSessionId || !avatarUrl) {
      updateStatus("unavailable");
      onFallback?.();
      return;
    }

    try {
      updateStatus("connecting");

      const statusRes = await fetch(`${apiBase}/video-call/avatar-stream/status`, {
        credentials: "include",
      });

      if (!statusRes.ok) {
        throw new Error("Avatar animation status check failed");
      }

      const statusData = await statusRes.json();
      if (!statusData.available) {
        updateStatus("unavailable");
        onFallback?.();
        return;
      }

      setProvider(statusData.provider);

      const createRes = await fetch(`${apiBase}/video-call/avatar-stream/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          videoCallSessionId,
          sourceUrl: avatarUrl,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        if (createRes.status === 503) {
          updateStatus("unavailable");
          onFallback?.();
          return;
        }
        throw new Error(errData.message || "Failed to create avatar stream");
      }

      const streamData = await createRes.json();

      const pc = new RTCPeerConnection({
        iceServers: streamData.iceServers || [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await fetch(`${apiBase}/video-call/avatar-stream/ice`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                videoCallSessionId,
                candidate: event.candidate.toJSON(),
              }),
            });
          } catch {
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          updateStatus("connected");
        } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          if (statusRef.current === "connected") {
            updateStatus("failed");
            onFallback?.();
            cleanup();
          }
        }
      };

      if (streamData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(streamData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`${apiBase}/video-call/avatar-stream/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            videoCallSessionId,
            answer: { type: answer.type, sdp: answer.sdp },
          }),
        });
      }

      updateStatus("connected");
    } catch (err) {
      console.warn("[AvatarAnimation] Failed to start stream:", err);
      updateStatus("failed");
      onFallback?.();
      cleanup();
    }
  }, [videoCallSessionId, avatarUrl, apiBase, onFallback, updateStatus, cleanup]);

  const stopStream = useCallback(async () => {
    if (videoCallSessionId) {
      try {
        await fetch(`${apiBase}/video-call/avatar-stream/destroy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ videoCallSessionId }),
        });
      } catch {
      }
    }
    cleanup();
    updateStatus("idle");
  }, [videoCallSessionId, apiBase, cleanup, updateStatus]);

  const sendAudio = useCallback(async (audioBase64: string, emotion?: EmotionState) => {
    if (!videoCallSessionId || statusRef.current !== "connected") return;

    try {
      await fetch(`${apiBase}/video-call/avatar-stream/talk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          videoCallSessionId,
          audioBase64,
          emotion,
        }),
      });
    } catch (err) {
      console.warn("[AvatarAnimation] Failed to send audio:", err);
    }
  }, [videoCallSessionId, apiBase]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    remoteStream,
    provider,
    startStream,
    stopStream,
    sendAudio,
    isPhotorealistic: status === "connected" && !!remoteStream,
  };
}
