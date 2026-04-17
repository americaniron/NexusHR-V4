import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "@clerk/express";
import { logger } from "./logger";
import { db } from "@workspace/db";
import { organizations } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getVideoSessionData } from "../routes/videoCall";
import { handleProactiveEvent, type ProactiveEventType } from "../services/proactive/eventListener";

export type DomainEvent =
  | "task:created" | "task:updated" | "task:deleted" | "task:assigned"
  | "employee:hired" | "employee:updated" | "employee:deactivated"
  | "notification:new" | "notification:read"
  | "conversation:message" | "conversation:typing"
  | "workflow:started" | "workflow:completed" | "workflow:failed"
  | "integration:connected" | "integration:disconnected"
  | "billing:alert_email" | "billing:plan_changed" | "billing:payment_failed" | "billing:trial_expired"
  | "proactive:rule_fired" | "proactive:rule_created" | "proactive:rule_updated";

export type Room = "tasks" | "employees" | "notifications" | "conversations" | "workflows" | "integrations" | "billing";

const VALID_ROOMS: Room[] = ["tasks", "employees", "notifications", "conversations", "workflows", "integrations", "billing"];

let io: Server | null = null;

function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  const deployUrl = process.env["REPLIT_DEPLOYMENT_URL"];
  const frontendUrl = process.env["FRONTEND_URL"];

  if (devDomain) origins.push(`https://${devDomain}`);
  if (deployUrl) origins.push(deployUrl.replace(/\/$/, ""));
  if (frontendUrl) origins.push(frontendUrl.replace(/\/$/, ""));

  return origins;
}

export function initWebSocket(httpServer: HttpServer): Server {
  const isDev = process.env["NODE_ENV"] === "development";
  const allowedOrigins = getAllowedOrigins();

  io = new Server(httpServer, {
    cors: {
      origin: isDev
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Origin not allowed"));
            }
          },
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required: token missing"));
    }

    try {
      const secretKey = process.env["CLERK_SECRET_KEY"];
      if (!secretKey) {
        return next(new Error("Server misconfiguration: CLERK_SECRET_KEY not set"));
      }

      const payload = await verifyToken(token, {
        secretKey,
      });

      const clerkUserId = payload.sub;
      const clerkOrgId = payload.org_id || null;

      socket.data.clerkUserId = clerkUserId;
      socket.data.clerkOrgId = clerkOrgId;

      if (clerkOrgId) {
        const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
        socket.data.orgId = org?.id ?? null;
      } else {
        socket.data.orgId = null;
      }

      next();
    } catch (err) {
      logger.warn({ err }, "WebSocket auth failed");
      next(new Error("Authentication failed: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const orgId = socket.data.orgId;
    const clerkUserId = socket.data.clerkUserId;
    logger.info({ socketId: socket.id, orgId, clerkUserId }, "WebSocket client connected");

    if (orgId) {
      socket.join(`org:${orgId}`);
    }

    socket.on("subscribe", (rooms: string[]) => {
      if (!orgId) {
        socket.emit("error", { message: "Cannot subscribe: no organization context" });
        return;
      }
      const validRooms = rooms.filter((r): r is Room => VALID_ROOMS.includes(r as Room));
      validRooms.forEach((room) => {
        socket.join(`org:${orgId}:${room}`);
        logger.debug({ socketId: socket.id, room }, "Client subscribed to room");
      });
      socket.emit("subscribed", validRooms);
    });

    socket.on("unsubscribe", (rooms: string[]) => {
      if (!orgId) return;
      const validRooms = rooms.filter((r): r is Room => VALID_ROOMS.includes(r as Room));
      validRooms.forEach((room) => {
        socket.leave(`org:${orgId}:${room}`);
      });
      socket.emit("unsubscribed", validRooms);
    });

    const videoCallSessions = new Set<string>();

    const isInVideoSession = (sessionId: string) => videoCallSessions.has(sessionId);

    socket.on("video-call:join", (sessionId: string) => {
      if (typeof sessionId !== "string" || sessionId.length > 100) return;

      const sessionData = getVideoSessionData(sessionId);
      if (!sessionData) {
        socket.emit("video-call:error", { message: "Invalid or expired video call session" });
        return;
      }
      if (sessionData.orgId !== orgId || sessionData.clerkUserId !== clerkUserId) {
        socket.emit("video-call:error", { message: "Not authorized for this video call session" });
        return;
      }

      const room = `video-call:${sessionId}`;
      videoCallSessions.add(sessionId);
      socket.join(room);
      socket.to(room).emit("video-call:peer-joined", { socketId: socket.id });
      logger.info({ socketId: socket.id, sessionId }, "Client joined video call");
    });

    socket.on("video-call:leave", (sessionId: string) => {
      if (!isInVideoSession(sessionId)) return;
      const room = `video-call:${sessionId}`;
      socket.to(room).emit("video-call:peer-left", { socketId: socket.id });
      socket.leave(room);
      videoCallSessions.delete(sessionId);
      logger.info({ socketId: socket.id, sessionId }, "Client left video call");
    });

    socket.on("video-call:offer", (payload: { sessionId: string; sdp: unknown }) => {
      if (!payload?.sessionId || !isInVideoSession(payload.sessionId)) return;
      const room = `video-call:${payload.sessionId}`;
      socket.to(room).emit("video-call:offer", { sdp: payload.sdp, from: socket.id });
    });

    socket.on("video-call:answer", (payload: { sessionId: string; sdp: unknown }) => {
      if (!payload?.sessionId || !isInVideoSession(payload.sessionId)) return;
      const room = `video-call:${payload.sessionId}`;
      socket.to(room).emit("video-call:answer", { sdp: payload.sdp, from: socket.id });
    });

    socket.on("video-call:ice-candidate", (payload: { sessionId: string; candidate: unknown }) => {
      if (!payload?.sessionId || !isInVideoSession(payload.sessionId)) return;
      const room = `video-call:${payload.sessionId}`;
      socket.to(room).emit("video-call:ice-candidate", { candidate: payload.candidate, from: socket.id });
    });

    socket.on("video-call:audio-data", (payload: { sessionId: string; audio: string; format: string }) => {
      if (!payload?.sessionId || !isInVideoSession(payload.sessionId)) return;
      const room = `video-call:${payload.sessionId}`;
      socket.to(room).emit("video-call:audio-data", { audio: payload.audio, format: payload.format, from: socket.id });
    });

    socket.on("video-call:ping", (payload: { sessionId: string; ts: number }) => {
      if (!payload?.sessionId || !isInVideoSession(payload.sessionId)) return;
      socket.emit("video-call:pong", { ts: payload.ts });
    });

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, reason }, "WebSocket client disconnected");
    });
  });

  logger.info("WebSocket server initialized");
  return io;
}

const DOMAIN_TO_PROACTIVE_EVENT: Partial<Record<DomainEvent, ProactiveEventType>> = {
  "task:created": "task:created",
  "task:updated": "task:updated",
  "workflow:completed": "workflow:completed",
  "workflow:failed": "workflow:failed",
  "billing:alert_email": "billing:alert",
  "employee:hired": "employee:hired",
  "integration:connected": "integration:connected",
};

function resolveProactiveEventType(event: DomainEvent, data: unknown): ProactiveEventType | null {
  if (event === "task:updated" && data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (record.status === "completed") return "task:completed";
    if (record.status === "failed") return "task:failed";
  }
  return DOMAIN_TO_PROACTIVE_EVENT[event] ?? null;
}

export function publishEvent(orgId: number, room: Room, event: DomainEvent, data: unknown): void {
  if (io) {
    const roomKey = `org:${orgId}:${room}`;
    io.to(roomKey).emit(event, {
      event,
      data,
      timestamp: Date.now(),
      orgId,
    });
  } else {
    logger.warn("WebSocket server not initialized, WebSocket event not emitted");
  }

  const proactiveType = resolveProactiveEventType(event, data);
  if (proactiveType) {
    handleProactiveEvent({
      type: proactiveType,
      orgId,
      data: (data && typeof data === "object" ? data : { value: data }) as Record<string, unknown>,
    }).catch((err) => {
      logger.warn({ err, event: proactiveType }, "Proactive event handler failed (non-blocking)");
    });
  }
}

export function publishToOrg(orgId: number, event: DomainEvent, data: unknown): void {
  if (!io) return;
  io.to(`org:${orgId}`).emit(event, {
    event,
    data,
    timestamp: Date.now(),
    orgId,
  });
}

export function getIO(): Server | null {
  return io;
}
