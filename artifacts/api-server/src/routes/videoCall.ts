import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { db } from "@workspace/db";
import { conversations, videoCallRecordings } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
import { ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const objectStorageService = new ObjectStorageService();

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

    if (!orgId || !userId || !clerkUserId) {
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

const requestRecordingUploadBody = z.object({
  sessionId: z.string().min(1),
  conversationId: z.number().int().positive(),
  durationMs: z.number().int().min(0),
  sizeBytes: z.number().int().positive(),
  mimeType: z.string().default("video/webm"),
});

router.post("/video-call/recordings/request-upload", requireAuth, validate({ body: requestRecordingUploadBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, conversationId, durationMs, sizeBytes, mimeType } = req.body;
    const { orgId, userId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
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

    const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
    const storagePath = objectStorageService.normalizeObjectEntityPath(uploadUrl);

    const [recording] = await db
      .insert(videoCallRecordings)
      .values({
        orgId,
        userId,
        conversationId,
        sessionId,
        durationMs,
        sizeBytes,
        mimeType,
        storagePath,
        status: "uploading",
      })
      .returning();

    res.json({
      recordingId: recording.id,
      uploadUrl,
      storagePath,
    });
  } catch (error) {
    next(error);
  }
});

const confirmRecordingUploadBody = z.object({
  recordingId: z.number().int().positive(),
});

router.post("/video-call/recordings/confirm-upload", requireAuth, validate({ body: confirmRecordingUploadBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recordingId } = req.body;
    const { orgId, userId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
    }

    const [recording] = await db
      .select()
      .from(videoCallRecordings)
      .where(
        and(
          eq(videoCallRecordings.id, recordingId),
          eq(videoCallRecordings.orgId, orgId),
          eq(videoCallRecordings.userId, userId),
        )
      );

    if (!recording) {
      throw new AppError(404, "NOT_FOUND", "Recording not found");
    }

    await db
      .update(videoCallRecordings)
      .set({ status: "ready" })
      .where(eq(videoCallRecordings.id, recordingId));

    res.json({ confirmed: true, recordingId });
  } catch (error) {
    next(error);
  }
});

router.get("/video-call/recordings", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, userId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
    }

    const conversationId = req.query.conversationId ? parseInt(req.query.conversationId as string, 10) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

    const conditions = [
      eq(videoCallRecordings.orgId, orgId),
      eq(videoCallRecordings.status, "ready"),
    ];

    if (conversationId) {
      conditions.push(eq(videoCallRecordings.conversationId, conversationId));
    }

    const recordings = await db
      .select()
      .from(videoCallRecordings)
      .where(and(...conditions))
      .orderBy(desc(videoCallRecordings.createdAt))
      .limit(limit);

    res.json({ recordings });
  } catch (error) {
    next(error);
  }
});

router.get("/video-call/recordings/:id/stream", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordingId = parseInt(String(req.params.id), 10);
    if (isNaN(recordingId)) {
      throw new AppError(400, "INVALID_INPUT", "Invalid recording ID");
    }

    const { orgId } = await getAuthContext(req);

    if (!orgId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
    }

    const [recording] = await db
      .select()
      .from(videoCallRecordings)
      .where(
        and(
          eq(videoCallRecordings.id, recordingId),
          eq(videoCallRecordings.orgId, orgId),
          eq(videoCallRecordings.status, "ready"),
        )
      );

    if (!recording) {
      throw new AppError(404, "NOT_FOUND", "Recording not found");
    }

    const objectFile = await objectStorageService.getObjectEntityFile(recording.storagePath);
    const downloadResponse = await objectStorageService.downloadObject(objectFile);
    const { Readable } = await import("stream");

    res.status(downloadResponse.status);
    res.setHeader("Content-Type", recording.mimeType);
    downloadResponse.headers.forEach((value, key) => {
      if (key !== "content-type") {
        res.setHeader(key, value);
      }
    });

    if (downloadResponse.body) {
      const nodeStream = Readable.fromWeb(downloadResponse.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/video-call/recordings/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordingId = parseInt(String(req.params.id), 10);
    if (isNaN(recordingId)) {
      throw new AppError(400, "INVALID_INPUT", "Invalid recording ID");
    }

    const { orgId, userId } = await getAuthContext(req);

    if (!orgId || !userId) {
      throw new AppError(403, "FORBIDDEN", "Organization context required");
    }

    const [recording] = await db
      .select()
      .from(videoCallRecordings)
      .where(
        and(
          eq(videoCallRecordings.id, recordingId),
          eq(videoCallRecordings.orgId, orgId),
          eq(videoCallRecordings.userId, userId),
        )
      );

    if (!recording) {
      throw new AppError(404, "NOT_FOUND", "Recording not found");
    }

    await db
      .delete(videoCallRecordings)
      .where(eq(videoCallRecordings.id, recordingId));

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
