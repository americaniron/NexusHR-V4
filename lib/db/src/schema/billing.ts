import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";

export const billingSubscriptions = pgTable("billing_subscriptions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").default("trial").notNull(),
  billingCycle: text("billing_cycle").default("monthly"),
  status: text("status").default("trialing").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  allocations: jsonb("allocations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usageEvents = pgTable("usage_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  dimension: text("dimension").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertBillingSubscriptionSchema = createInsertSchema(billingSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBillingSubscription = z.infer<typeof insertBillingSubscriptionSchema>;
export type BillingSubscription = typeof billingSubscriptions.$inferSelect;

export const insertUsageEventSchema = createInsertSchema(usageEvents).omit({ id: true, recordedAt: true });
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageEvent = typeof usageEvents.$inferSelect;
