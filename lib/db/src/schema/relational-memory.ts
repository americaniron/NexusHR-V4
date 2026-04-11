import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";
import { users } from "./users";
import { aiEmployees } from "./ai-employees";

export const relationalMemories = pgTable("relational_memories", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  aiEmployeeId: integer("ai_employee_id").references(() => aiEmployees.id).notNull(),
  memoryType: text("memory_type").notNull(),
  category: text("category"),
  content: text("content").notNull(),
  relevanceScore: real("relevance_score").default(0.5).notNull(),
  accessCount: integer("access_count").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRelationalMemorySchema = createInsertSchema(relationalMemories).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRelationalMemory = z.infer<typeof insertRelationalMemorySchema>;
export type RelationalMemory = typeof relationalMemories.$inferSelect;
