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

const router = Router();

interface VideoCallSessionData {
  conversationId: number;
  orgId: number;
  userId: number;
  clerkUserId: string;
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

export default router;
