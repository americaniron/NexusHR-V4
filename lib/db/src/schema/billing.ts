import { pgTable, text, serial, integer, timestamp, jsonb, boolean, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizations } from "./organizations";

export const billingSubscriptions = pgTable("billing_subscriptions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  plan: text("plan").default("trial").notNull(),
  billingCycle: text("billing_cycle").default("monthly"),
  status: text("status").default("trialing").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  allocations: jsonb("allocations"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  failedPaymentCount: integer("failed_payment_count").default(0),
  lastPaymentError: text("last_payment_error"),
  graceEndsAt: timestamp("grace_ends_at"),
  suspendedAt: timestamp("suspended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_billing_subs_org_id").on(table.orgId),
  index("idx_billing_subs_status").on(table.status),
  index("idx_billing_subs_trial_ends").on(table.trialEndsAt),
]);

export const usageEvents = pgTable("usage_events", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  dimension: text("dimension").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => [
  index("idx_usage_events_org_id").on(table.orgId),
  index("idx_usage_events_org_dimension").on(table.orgId, table.dimension),
  index("idx_usage_events_recorded_at").on(table.recordedAt),
]);

export const billingAlerts = pgTable("billing_alerts", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  dimension: text("dimension").notNull(),
  thresholdPercent: integer("threshold_percent").notNull(),
  currentPercent: integer("current_percent").notNull(),
  planLimit: numeric("plan_limit").notNull(),
  currentUsage: numeric("current_usage").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billingInvoices = pgTable("billing_invoices", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id).notNull(),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountDue: integer("amount_due").notNull(),
  amountPaid: integer("amount_paid").default(0),
  currency: text("currency").default("usd").notNull(),
  status: text("status").notNull(),
  description: text("description"),
  invoiceUrl: text("invoice_url"),
  pdfUrl: text("pdf_url"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBillingSubscriptionSchema = createInsertSchema(billingSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBillingSubscription = z.infer<typeof insertBillingSubscriptionSchema>;
export type BillingSubscription = typeof billingSubscriptions.$inferSelect;

export const insertUsageEventSchema = createInsertSchema(usageEvents).omit({ id: true, recordedAt: true });
export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageEvent = typeof usageEvents.$inferSelect;

export const insertBillingAlertSchema = createInsertSchema(billingAlerts).omit({ id: true, createdAt: true });
export type InsertBillingAlert = z.infer<typeof insertBillingAlertSchema>;
export type BillingAlert = typeof billingAlerts.$inferSelect;

export const insertBillingInvoiceSchema = createInsertSchema(billingInvoices).omit({ id: true, createdAt: true });
export type InsertBillingInvoice = z.infer<typeof insertBillingInvoiceSchema>;
export type BillingInvoice = typeof billingInvoices.$inferSelect;
