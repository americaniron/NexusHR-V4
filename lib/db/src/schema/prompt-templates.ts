import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";

export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  layer: text("layer").notNull(),
  version: integer("version").default(1).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables"),
  metadata: jsonb("metadata"),
  roleId: integer("role_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
