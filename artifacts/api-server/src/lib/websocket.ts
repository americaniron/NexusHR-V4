import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { logger } from "./logger";

export type DomainEvent =
  | "task:created" | "task:updated" | "task:deleted" | "task:assigned"
  | "employee:hired" | "employee:updated" | "employee:deactivated"
  | "notification:new" | "notification:read"
  | "conversation:message" | "conversation:typing"
  | "workflow:started" | "workflow:completed" | "workflow:failed"
  | "integration:connected" | "integration:disconnected";

export type Room = "tasks" | "employees" | "notifications" | "conversations" | "workflows" | "integrations";

const VALID_ROOMS: Room[] = ["tasks", "employees", "notifications", "conversations", "workflows", "integrations"];

let io: Server | null = null;

function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  const deployUrl = process.env["REPLIT_DEPLOYMENT_URL"];
  const frontendUrl = process.env["FRONTEND_URL"];

  if (devDomain) origins.push(`https://${devDomain}`);
  if (deployUrl) origins.push(deployUrl);
  if (frontendUrl) origins.push(frontendUrl);

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
            if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
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

  io.use((socket, next) => {
    const orgId = socket.handshake.auth?.orgId;
    const userId = socket.handshake.auth?.userId;

    if (!orgId || !userId) {
      return next(new Error("Authentication required: orgId and userId must be provided"));
    }

    socket.data.orgId = orgId;
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const orgId = socket.data.orgId;
    logger.info({ socketId: socket.id, orgId }, "WebSocket client connected");

    socket.join(`org:${orgId}`);

    socket.on("subscribe", (rooms: string[]) => {
      const validRooms = rooms.filter((r): r is Room => VALID_ROOMS.includes(r as Room));
      validRooms.forEach((room) => {
        socket.join(`org:${orgId}:${room}`);
        logger.debug({ socketId: socket.id, room }, "Client subscribed to room");
      });
      socket.emit("subscribed", validRooms);
    });

    socket.on("unsubscribe", (rooms: string[]) => {
      const validRooms = rooms.filter((r): r is Room => VALID_ROOMS.includes(r as Room));
      validRooms.forEach((room) => {
        socket.leave(`org:${orgId}:${room}`);
      });
      socket.emit("unsubscribed", validRooms);
    });

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, reason }, "WebSocket client disconnected");
    });
  });

  logger.info("WebSocket server initialized");
  return io;
}

export function publishEvent(orgId: number, room: Room, event: DomainEvent, data: unknown): void {
  if (!io) {
    logger.warn("WebSocket server not initialized, event not published");
    return;
  }
  const roomKey = `org:${orgId}:${room}`;
  io.to(roomKey).emit(event, {
    event,
    data,
    timestamp: Date.now(),
    orgId,
  });
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
