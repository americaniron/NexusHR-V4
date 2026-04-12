import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { aiEmployees } from "./ai-employees";

export const videoProjects = pgTable("video_projects", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  duration: integer("duration").default(10).notNull(),
  aspectRatio: text("aspect_ratio").default("16:9").notNull(),
  enhance: boolean("enhance").default(true).notNull(),
  status: text("status").default("queued").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  employeeId: integer("employee_id").references(() => aiEmployees.id),
  errorMessage: text("error_message"),
  heygenVideoId: text("heygen_video_id"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoProjectSchema = createInsertSchema(videoProjects).omit({ id: true, createdAt: true });
export type InsertVideoProject = z.infer<typeof insertVideoProjectSchema>;
export type VideoProject = typeof videoProjects.$inferSelect;
