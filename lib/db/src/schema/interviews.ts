import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { users } from "./users";
import { aiEmployeeRoles } from "./ai-employee-roles";

export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => aiEmployeeRoles.id).notNull(),
  status: text("status").default("active").notNull(),
  mode: text("mode").default("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const interviewCandidates = pgTable("interview_candidates", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => interviewSessions.id).notNull(),
  candidateName: text("candidate_name").notNull(),
  personalityProfile: jsonb("personality_profile"),
  avatarUrl: text("avatar_url"),
  voiceId: text("voice_id"),
  scores: jsonb("scores"),
  selected: integer("selected").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewMessages = pgTable("interview_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => interviewSessions.id).notNull(),
  candidateId: integer("candidate_id").references(() => interviewCandidates.id).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({ id: true, createdAt: true, completedAt: true });
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;

export const insertInterviewCandidateSchema = createInsertSchema(interviewCandidates).omit({ id: true, createdAt: true });
export type InsertInterviewCandidate = z.infer<typeof insertInterviewCandidateSchema>;
export type InterviewCandidate = typeof interviewCandidates.$inferSelect;

export const insertInterviewMessageSchema = createInsertSchema(interviewMessages).omit({ id: true, createdAt: true });
export type InsertInterviewMessage = z.infer<typeof insertInterviewMessageSchema>;
export type InterviewMessage = typeof interviewMessages.$inferSelect;
