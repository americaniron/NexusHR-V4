import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

type Room = "tasks" | "employees" | "notifications" | "conversations" | "workflows" | "integrations";

interface SocketOptions {
  orgId: string | number | null;
  userId?: string | null;
  rooms?: Room[];
  enabled?: boolean;
}

interface QueuedMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

const ROOM_TO_QUERY_KEYS: Record<Room, string[]> = {
  tasks: ["/api/tasks", "/api/dashboard"],
  employees: ["/api/employees", "/api/dashboard"],
  notifications: ["/api/notifications"],
  conversations: ["/api/conversations"],
  workflows: ["/api/workflows"],
  integrations: ["/api/integrations"],
};

export function useSocket({ orgId, userId, rooms = [], enabled = true }: SocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const offlineQueueRef = useRef<QueuedMessage[]>([]);

  const flushOfflineQueue = useCallback(() => {
    if (!socketRef.current?.connected) return;
    const queue = offlineQueueRef.current;
    offlineQueueRef.current = [];
    queue.forEach((msg) => {
      socketRef.current?.emit(msg.event, msg.data);
    });
  }, []);

  useEffect(() => {
    if (!enabled || !orgId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const socket = io(baseUrl, {
      auth: { orgId, userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (rooms.length > 0) {
        socket.emit("subscribe", rooms);
      }
      flushOfflineQueue();
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", () => {
      setConnected(false);
    });

    rooms.forEach((room) => {
      const queryKeys = ROOM_TO_QUERY_KEYS[room] || [];
      const eventPatterns = getEventsForRoom(room);

      eventPatterns.forEach((eventName) => {
        socket.on(eventName, () => {
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        });
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [orgId, userId, enabled, rooms.join(","), queryClient, flushOfflineQueue]);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      offlineQueueRef.current.push({ event, data, timestamp: Date.now() });
    }
  }, []);

  const subscribe = useCallback((rooms: Room[]) => {
    socketRef.current?.emit("subscribe", rooms);
  }, []);

  const unsubscribe = useCallback((rooms: Room[]) => {
    socketRef.current?.emit("unsubscribe", rooms);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    emit,
    subscribe,
    unsubscribe,
  };
}

function getEventsForRoom(room: Room): string[] {
  const events: Record<Room, string[]> = {
    tasks: ["task:created", "task:updated", "task:deleted", "task:assigned"],
    employees: ["employee:hired", "employee:updated", "employee:deactivated"],
    notifications: ["notification:new", "notification:read"],
    conversations: ["conversation:message", "conversation:typing"],
    workflows: ["workflow:started", "workflow:completed", "workflow:failed"],
    integrations: ["integration:connected", "integration:disconnected"],
  };
  return events[room] || [];
}

export function useOptimisticUpdate<T>(queryKey: string[]) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async (
      updater: (old: T | undefined) => T,
      mutationFn: () => Promise<unknown>,
    ) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);

      queryClient.setQueryData<T>(queryKey, (old) => updater(old));

      try {
        await mutationFn();
      } catch {
        queryClient.setQueryData<T>(queryKey, previousData);
        throw new Error("Mutation failed, rolled back optimistic update");
      }
    },
    [queryClient, queryKey],
  );

  return optimisticUpdate;
}
