import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";

export const complianceDataRequests = pgTable("compliance_data_requests", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  type: text("type").notNull(),
  status: text("status").default("pending").notNull(),
  requestedBy: text("requested_by").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  downloadUrl: text("download_url"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complianceConsentRecords = pgTable("compliance_consent_records", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  userId: text("user_id").notNull(),
  consentType: text("consent_type").notNull(),
  granted: boolean("granted").default(false).notNull(),
  version: text("version").default("1.0").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complianceRetentionPolicies = pgTable("compliance_retention_policies", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  dataType: text("data_type").notNull(),
  retentionDays: integer("retention_days").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  lastPurgedAt: timestamp("last_purged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertComplianceDataRequestSchema = createInsertSchema(complianceDataRequests).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplianceDataRequest = z.infer<typeof insertComplianceDataRequestSchema>;
export type ComplianceDataRequest = typeof complianceDataRequests.$inferSelect;

export const insertComplianceConsentRecordSchema = createInsertSchema(complianceConsentRecords).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplianceConsentRecord = z.infer<typeof insertComplianceConsentRecordSchema>;
export type ComplianceConsentRecord = typeof complianceConsentRecords.$inferSelect;

export const insertComplianceRetentionPolicySchema = createInsertSchema(complianceRetentionPolicies).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplianceRetentionPolicy = z.infer<typeof insertComplianceRetentionPolicySchema>;
export type ComplianceRetentionPolicy = typeof complianceRetentionPolicies.$inferSelect;
