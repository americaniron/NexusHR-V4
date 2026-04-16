import { logger } from "./logger";
import type { EmotionState } from "./emotionEngine";

const DID_API_BASE = "https://api.d-id.com";

interface SDPDescriptionInit {
  type: string;
  sdp?: string;
}

interface ICEServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface ICECandidateInit {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}

export interface AvatarAnimationConfig {
  provider: "d-id" | "heygen";
  apiKey: string;
  sourceUrl?: string;
  avatarId?: string;
}

export interface AvatarStreamSession {
  id: string;
  streamId: string;
  provider: "d-id" | "heygen";
  offer?: SDPDescriptionInit;
  iceServers?: ICEServerConfig[];
  sessionUrl?: string;
  createdAt: number;
}

export interface EmotionExpressionParams {
  expression: string;
  intensity: number;
}

const EMOTION_TO_EXPRESSION: Record<EmotionState, EmotionExpressionParams> = {
  neutral: { expression: "neutral", intensity: 0.0 },
  enthusiastic: { expression: "happy", intensity: 0.8 },
  empathetic: { expression: "serious", intensity: 0.5 },
  focused: { expression: "serious", intensity: 0.7 },
  reassuring: { expression: "happy", intensity: 0.4 },
  apologetic: { expression: "serious", intensity: 0.6 },
  thoughtful: { expression: "serious", intensity: 0.3 },
};

function getApiKey(): string | null {
  return process.env.DID_API_KEY || process.env.HEYGEN_API_KEY || null;
}

function getProvider(): "d-id" | "heygen" {
  if (process.env.HEYGEN_API_KEY) return "heygen";
  return "d-id";
}

export function isAvatarAnimationAvailable(): boolean {
  return !!getApiKey();
}

export function getEmotionExpression(emotion: EmotionState): EmotionExpressionParams {
  return EMOTION_TO_EXPRESSION[emotion] || EMOTION_TO_EXPRESSION.neutral;
}

async function didFetch(path: string, init?: RequestInit): Promise<Response> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("D-ID API key not configured");
  }

  return fetch(`${DID_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> || {}),
    },
  });
}

export async function createStreamSession(
  sourceUrl: string
): Promise<AvatarStreamSession> {
  const provider = getProvider();

  if (provider === "d-id") {
    return createDIDStreamSession(sourceUrl);
  }

  return createHeyGenStreamSession(sourceUrl);
}

async function createDIDStreamSession(sourceUrl: string): Promise<AvatarStreamSession> {
  const response = await didFetch("/talks/streams", {
    method: "POST",
    body: JSON.stringify({
      source_url: sourceUrl,
      driver_url: "bank://lively",
      config: {
        stitch: true,
        result_format: "mp4",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error({ status: response.status, errorText }, "D-ID stream creation failed");
    throw new Error(`D-ID stream creation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    id: string;
    stream_id: string;
    offer?: SDPDescriptionInit;
    ice_servers?: Array<{ urls: string | string[]; username?: string; credential?: string }>;
    session_id?: string;
  };

  return {
    id: data.id,
    streamId: data.stream_id,
    provider: "d-id",
    offer: data.offer,
    iceServers: data.ice_servers?.map(s => ({
      urls: s.urls,
      username: s.username,
      credential: s.credential,
    })),
    sessionUrl: `${DID_API_BASE}/talks/streams/${data.stream_id}`,
    createdAt: Date.now(),
  };
}

async function createHeyGenStreamSession(sourceUrl: string): Promise<AvatarStreamSession> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("HeyGen API key not configured");

  const response = await fetch("https://api.heygen.com/v1/streaming.new", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quality: "medium",
      avatar_name: sourceUrl,
      voice: { voice_id: "" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error({ status: response.status, errorText }, "HeyGen stream creation failed");
    throw new Error(`HeyGen stream creation failed: ${response.status}`);
  }

  const data = await response.json() as {
    data: {
      session_id: string;
      sdp: SDPDescriptionInit;
      ice_servers: Array<{ urls: string | string[]; username?: string; credential?: string }>;
    };
  };

  return {
    id: data.data.session_id,
    streamId: data.data.session_id,
    provider: "heygen",
    offer: data.data.sdp,
    iceServers: data.data.ice_servers?.map(s => ({
      urls: s.urls,
      username: s.username,
      credential: s.credential,
    })),
    createdAt: Date.now(),
  };
}

export async function sendStreamAnswer(
  session: AvatarStreamSession,
  answer: SDPDescriptionInit
): Promise<void> {
  if (session.provider === "d-id") {
    const response = await didFetch(`/talks/streams/${session.streamId}/sdp`, {
      method: "POST",
      body: JSON.stringify({
        answer,
        session_id: session.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      logger.error({ errorText }, "D-ID SDP answer failed");
      throw new Error(`D-ID SDP answer failed: ${response.status}`);
    }
  } else {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("HeyGen API key not configured");

    const response = await fetch("https://api.heygen.com/v1/streaming.start", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: session.id,
        sdp: answer,
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen stream start failed: ${response.status}`);
    }
  }
}

export async function sendStreamICECandidate(
  session: AvatarStreamSession,
  candidate: ICECandidateInit
): Promise<void> {
  if (session.provider === "d-id") {
    const response = await didFetch(`/talks/streams/${session.streamId}/ice`, {
      method: "POST",
      body: JSON.stringify({
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
        session_id: session.id,
      }),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, "D-ID ICE candidate failed");
    }
  }
}

export async function sendAudioToStream(
  session: AvatarStreamSession,
  audioBase64: string,
  emotion?: EmotionState
): Promise<void> {
  const expressionParams = emotion ? getEmotionExpression(emotion) : undefined;

  if (session.provider === "d-id") {
    const body: Record<string, unknown> = {
      script: {
        type: "audio",
        audio_url: `data:audio/mp3;base64,${audioBase64.replace(/^data:audio\/[^;]+;base64,/, "")}`,
      },
      driver_url: "bank://lively",
      session_id: session.id,
    };

    if (expressionParams && expressionParams.expression !== "neutral") {
      body.config = {
        expression: {
          expressions: [
            {
              start_frame: 0,
              expression: expressionParams.expression,
              intensity: expressionParams.intensity,
            },
          ],
        },
      };
    }

    const response = await didFetch(`/talks/streams/${session.streamId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      logger.error({ errorText }, "D-ID audio send failed");
      throw new Error(`D-ID audio send failed: ${response.status}`);
    }
  } else {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("HeyGen API key not configured");

    const response = await fetch("https://api.heygen.com/v1/streaming.task", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: session.id,
        task_type: "talk",
        task_input: {
          audio: audioBase64.replace(/^data:audio\/[^;]+;base64,/, ""),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen talk task failed: ${response.status}`);
    }
  }
}

export async function destroyStreamSession(
  session: AvatarStreamSession
): Promise<void> {
  try {
    if (session.provider === "d-id") {
      await didFetch(`/talks/streams/${session.streamId}`, {
        method: "DELETE",
        body: JSON.stringify({ session_id: session.id }),
      });
    } else {
      const apiKey = getApiKey();
      if (!apiKey) return;

      await fetch("https://api.heygen.com/v1/streaming.stop", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: session.id }),
      });
    }
  } catch (err) {
    logger.warn({ err, sessionId: session.id }, "Failed to destroy avatar stream session");
  }
}

const activeSessions = new Map<string, AvatarStreamSession>();

const STREAM_SESSION_TTL_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, session] of activeSessions) {
    if (now - session.createdAt > STREAM_SESSION_TTL_MS) {
      destroyStreamSession(session).catch(() => {});
      activeSessions.delete(key);
    }
  }
}, 60_000);

export function storeAvatarSession(videoCallSessionId: string, session: AvatarStreamSession): void {
  activeSessions.set(videoCallSessionId, session);
}

export function getAvatarSession(videoCallSessionId: string): AvatarStreamSession | undefined {
  return activeSessions.get(videoCallSessionId);
}

export function removeAvatarSession(videoCallSessionId: string): void {
  const session = activeSessions.get(videoCallSessionId);
  if (session) {
    destroyStreamSession(session).catch(() => {});
    activeSessions.delete(videoCallSessionId);
  }
}
