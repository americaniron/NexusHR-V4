import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { db } from "@workspace/db";
import { conversations } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  isAvatarAnimationAvailable,
  createStreamSession,
  sendStreamAnswer,
  sendStreamICECandidate,
  sendAudioToStream,
  storeAvatarSession,
  getAvatarSession,
  removeAvatarSession,
  getEmotionExpression,
} from "../lib/avatarAnimation";
import type { EmotionState } from "../lib/emotionEngine";

const router = Router();

interface VideoCallSessionData {
  conversationId: number;
  orgId: number;
  userId: number;
  clerkUserId: string | null;
  createdAt: number;
}

const activeVideoSessions = new Map<string, VideoCallSessionData>();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeVideoSessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      activeVideoSessions.delete(id);
    }
  }
}, 60_000);

export function getVideoSessionData(sessionId: string): VideoCallSessionData | undefined {
  return activeVideoSessions.get(sessionId);
}

const createSessionBody = z.object({
  conversationId: z.number().int().positive(),
  employeeId: z.number().int().positive().optional(),
});

router.post("/video-call/session", requireAuth, validate({ body: createSessionBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, employeeId } = req.body;
    const { orgId, userId, clerkUserId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required for video calls");
    }

    const [conv] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.orgId, orgId),
          eq(conversations.userId, userId),
        )
      );

    if (!conv) {
      throw new AppError(404, "NOT_FOUND", "Conversation not found or access denied");
    }

    const sessionId = randomUUID();

    activeVideoSessions.set(sessionId, {
      conversationId,
      orgId,
      userId,
      clerkUserId,
      createdAt: Date.now(),
    });

    res.json({
      sessionId,
      conversationId,
      employeeId,
      avatarAnimationAvailable: isAvatarAnimationAvailable(),
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

const avatarStreamBody = z.object({
  videoCallSessionId: z.string().uuid(),
  sourceUrl: z.string().url(),
});

router.post("/video-call/avatar-stream/create", requireAuth, validate({ body: avatarStreamBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoCallSessionId, sourceUrl } = req.body;
    const { orgId, userId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
    }

    const sessionData = activeVideoSessions.get(videoCallSessionId);
    if (!sessionData || sessionData.userId !== userId) {
      throw new AppError(404, "NOT_FOUND", "Video call session not found");
    }

    if (!isAvatarAnimationAvailable()) {
      throw new AppError(503, "UNAVAILABLE", "Avatar animation service is not configured");
    }

    const streamSession = await createStreamSession(sourceUrl);
    storeAvatarSession(videoCallSessionId, streamSession);

    res.json({
      streamId: streamSession.streamId,
      provider: streamSession.provider,
      offer: streamSession.offer,
      iceServers: streamSession.iceServers,
    });
  } catch (error) {
    next(error);
  }
});

const avatarAnswerBody = z.object({
  videoCallSessionId: z.string().uuid(),
  answer: z.object({
    type: z.string(),
    sdp: z.string(),
  }),
});

router.post("/video-call/avatar-stream/answer", requireAuth, validate({ body: avatarAnswerBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoCallSessionId, answer } = req.body;

    const session = getAvatarSession(videoCallSessionId);
    if (!session) {
      throw new AppError(404, "NOT_FOUND", "Avatar stream session not found");
    }

    await sendStreamAnswer(session, answer);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const avatarIceBody = z.object({
  videoCallSessionId: z.string().uuid(),
  candidate: z.object({
    candidate: z.string(),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().nullable().optional(),
  }),
});

router.post("/video-call/avatar-stream/ice", requireAuth, validate({ body: avatarIceBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoCallSessionId, candidate } = req.body;

    const session = getAvatarSession(videoCallSessionId);
    if (!session) {
      throw new AppError(404, "NOT_FOUND", "Avatar stream session not found");
    }

    await sendStreamICECandidate(session, candidate);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const avatarTalkBody = z.object({
  videoCallSessionId: z.string().uuid(),
  audioBase64: z.string(),
  emotion: z.enum(["neutral", "enthusiastic", "empathetic", "focused", "reassuring", "apologetic", "thoughtful"]).optional(),
});

router.post("/video-call/avatar-stream/talk", requireAuth, validate({ body: avatarTalkBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoCallSessionId, audioBase64, emotion } = req.body;

    const session = getAvatarSession(videoCallSessionId);
    if (!session) {
      throw new AppError(404, "NOT_FOUND", "Avatar stream session not found");
    }

    await sendAudioToStream(session, audioBase64, emotion);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

const avatarDestroyBody = z.object({
  videoCallSessionId: z.string().uuid(),
});

router.post("/video-call/avatar-stream/destroy", requireAuth, validate({ body: avatarDestroyBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoCallSessionId } = req.body;
    removeAvatarSession(videoCallSessionId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/video-call/avatar-stream/status", requireAuth, async (_req: Request, res: Response) => {
  res.json({
    available: isAvatarAnimationAvailable(),
    provider: isAvatarAnimationAvailable() ? (process.env.HEYGEN_API_KEY ? "heygen" : "d-id") : null,
  });
});

const avatarExpressionBody = z.object({
  emotion: z.enum(["neutral", "enthusiastic", "empathetic", "focused", "reassuring", "apologetic", "thoughtful"]),
});

router.post("/video-call/avatar-stream/expression", requireAuth, validate({ body: avatarExpressionBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emotion } = req.body;
    const expression = getEmotionExpression(emotion);
    res.json(expression);
  } catch (error) {
    next(error);
  }
});

export default router;
