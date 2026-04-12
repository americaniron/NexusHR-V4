import { pgTable, serial, integer, text, timestamp, jsonb, real, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";

export const avatarAssets = pgTable("avatar_assets", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id),
  employeeId: integer("employee_id"),
  version: integer("version").default(1).notNull(),
  status: text("status").default("active").notNull(),
  faceImageUrl: text("face_image_url").notNull(),
  faceImagePath: text("face_image_path"),
  attributeVector: jsonb("attribute_vector").notNull(),
  latentVector: jsonb("latent_vector"),
  perceptualHash: text("perceptual_hash"),
  qualityScore: real("quality_score"),
  generationParams: jsonb("generation_params").notNull(),
  identityPackage: jsonb("identity_package").notNull(),
  pipelineMetadata: jsonb("pipeline_metadata"),
  isPreGenerated: boolean("is_pre_generated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAvatarAssetSchema = createInsertSchema(avatarAssets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAvatarAsset = z.infer<typeof insertAvatarAssetSchema>;
export type AvatarAsset = typeof avatarAssets.$inferSelect;
