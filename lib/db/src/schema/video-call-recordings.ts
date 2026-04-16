import { pgTable, text, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { users } from "./users";
import { conversations } from "./conversations";

export const videoCallRecordings = pgTable("video_call_recordings", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  sessionId: text("session_id").notNull(),
  title: text("title"),
  durationMs: integer("duration_ms"),
  sizeBytes: integer("size_bytes"),
  mimeType: text("mime_type").default("video/webm").notNull(),
  storagePath: text("storage_path").notNull(),
  status: text("status").default("ready").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_vcr_org_id").on(table.orgId),
  index("idx_vcr_conversation_id").on(table.conversationId),
  index("idx_vcr_user_id").on(table.userId),
  index("idx_vcr_session_id").on(table.sessionId),
]);

export const insertVideoCallRecordingSchema = createInsertSchema(videoCallRecordings).omit({ id: true, createdAt: true });
export type InsertVideoCallRecording = z.infer<typeof insertVideoCallRecordingSchema>;
export type VideoCallRecording = typeof videoCallRecordings.$inferSelect;
