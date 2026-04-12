import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { billingSubscriptions, billingAlerts, billingInvoices } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { z } from "zod/v4";
import { validate, idParam } from "../middlewares/validate";
import { logger } from "../lib/logger";
import {
  PLAN_DEFINITIONS,
  getPlanLimits,
  getPlanOverageRates,
  DUNNING_CONFIG,
  TRIAL_DURATION_DAYS,
  type PlanId,
} from "../lib/billing/plans";
import { getUsageSummary } from "../lib/billing/metering";
import { publishEvent } from "../lib/websocket";

const router = Router();

let _stripeClient: any = null;
let _stripeKey: string | null = null;

async function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (_stripeClient && _stripeKey === process.env.STRIPE_SECRET_KEY) return _stripeClient;
  const Stripe = (await import("stripe")).default;
  _stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  _stripeKey = process.env.STRIPE_SECRET_KEY;
  return _stripeClient;
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
}

router.get("/billing/plans", requireAuth, async (_req, res, next) => {
  try {
    const plans = Object.values(PLAN_DEFINITIONS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthly: plan.monthly,
      annual: plan.annual,
      allocations: plan.allocations,
      overageRates: plan.overageRates,
      features: plan.features,
      sla: plan.sla,
      supportLevel: plan.supportLevel,
    }));
    res.json({ data: plans });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/subscription", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.notFound("No organization");

    let [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));

    if (!sub) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
      [sub] = await db
        .insert(billingSubscriptions)
        .values({
          orgId,
          plan: "trial",
          status: "trialing",
          trialEndsAt: trialEnd,
          allocations: getPlanLimits("trial"),
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        })
        .returning();
    }

    const plan = PLAN_DEFINITIONS[sub.plan as PlanId];
    res.json({
      ...sub,
      planDetails: plan
        ? { name: plan.name, features: plan.features, sla: plan.sla, supportLevel: plan.supportLevel }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/usage", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ dimensions: [] });

    const dimensions = await getUsageSummary(orgId);
    res.json({ dimensions });
  } catch (error) {
    next(error);
  }
});

const checkoutBody = z.object({
  plan: z.enum(["starter", "growth", "business", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

router.post("/billing/checkout", requireAuth, validate({ body: checkoutBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { plan, billingCycle } = req.body;

    if (plan === "enterprise") {
      return res.json({ type: "contact_sales", message: "Please contact sales for Enterprise pricing." });
    }

    const stripe = await getStripeClient();
    if (!stripe) {
      const result = await directActivation(orgId, plan as PlanId, billingCycle);
      return res.json({ type: "activated", subscription: result });
    }

    const planDef = PLAN_DEFINITIONS[plan as PlanId];
    const unitAmount = (billingCycle === "annual" ? planDef.annual : planDef.monthly) * 100;

    let [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    let customerId = sub?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { orgId: String(orgId) },
      });
      customerId = customer.id;
      if (sub) {
        await db.update(billingSubscriptions)
          .set({ stripeCustomerId: customerId, updatedAt: new Date() })
          .where(eq(billingSubscriptions.orgId, orgId));
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            recurring: { interval: billingCycle === "annual" ? "year" : "month" },
            product_data: { name: `NexsusHR ${planDef.name} Plan` },
          },
          quantity: 1,
        },
      ],
      success_url: `${getFrontendUrl()}/billing?success=true`,
      cancel_url: `${getFrontendUrl()}/billing?canceled=true`,
      metadata: { orgId: String(orgId), plan, billingCycle },
      subscription_data: {
        metadata: { orgId: String(orgId), plan, billingCycle },
      },
    });

    res.json({ type: "checkout", url: session.url });
  } catch (error) {
    next(error);
  }
});

const changePlanBody = z.object({
  plan: z.enum(["starter", "growth", "business"]),
  billingCycle: z.enum(["monthly", "annual"]).optional(),
});

router.post("/billing/change-plan", requireAuth, validate({ body: changePlanBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const { plan: newPlan, billingCycle } = req.body;

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    if (!sub) throw AppError.notFound("No subscription found");

    const stripe = await getStripeClient();
    if (!stripe || !sub.stripeSubscriptionId) {
      const result = await directActivation(orgId, newPlan as PlanId, billingCycle || sub.billingCycle || "monthly");
      return res.json({ type: "changed", subscription: result });
    }

    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const planDef = PLAN_DEFINITIONS[newPlan as PlanId];
    const cycle = billingCycle || sub.billingCycle || "monthly";
    const unitAmount = (cycle === "annual" ? planDef.annual : planDef.monthly) * 100;

    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: unitAmount,
      recurring: { interval: cycle === "annual" ? "year" : "month" },
      product_data: { name: `NexsusHR ${planDef.name} Plan` },
    });

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      items: [{ id: stripeSub.items.data[0].id, price: price.id }],
      proration_behavior: "create_prorations",
      metadata: { orgId: String(orgId), plan: newPlan, billingCycle: cycle },
    });

    const [updated] = await db.update(billingSubscriptions).set({
      plan: newPlan,
      billingCycle: cycle,
      allocations: getPlanLimits(newPlan),
      updatedAt: new Date(),
    }).where(eq(billingSubscriptions.orgId, orgId)).returning();

    publishEvent(orgId, "notifications", "notification:new", {
      type: "plan_changed",
      plan: newPlan,
    });

    res.json({ type: "changed", subscription: updated });
  } catch (error) {
    next(error);
  }
});

router.post("/billing/cancel", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    if (!sub) throw AppError.notFound("No subscription found");

    const stripe = await getStripeClient();
    if (stripe && sub.stripeSubscriptionId) {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const [updated] = await db.update(billingSubscriptions).set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    }).where(eq(billingSubscriptions.orgId, orgId)).returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/billing/portal", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    if (!sub?.stripeCustomerId) {
      throw AppError.badRequest("No Stripe customer found. Upgrade your plan first.");
    }

    const stripe = await getStripeClient();
    if (!stripe) throw AppError.badRequest("Stripe is not configured.");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${getFrontendUrl()}/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/invoices", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ data: [] });

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));

    const stripe = await getStripeClient();
    if (stripe && sub?.stripeCustomerId) {
      const invoices = await stripe.invoices.list({
        customer: sub.stripeCustomerId,
        limit: 24,
      });

      const data = invoices.data.map((inv: any) => ({
        id: inv.id,
        amountDue: inv.amount_due,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        description: inv.description || `Invoice for ${inv.lines?.data?.[0]?.description || "subscription"}`,
        invoiceUrl: inv.hosted_invoice_url,
        pdfUrl: inv.invoice_pdf,
        periodStart: inv.period_start ? new Date(inv.period_start * 1000) : null,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
        paidAt: inv.status_transitions?.paid_at ? new Date(inv.status_transitions.paid_at * 1000) : null,
        createdAt: new Date(inv.created * 1000),
      }));

      return res.json({ data });
    }

    const localInvoices = await db.select().from(billingInvoices)
      .where(eq(billingInvoices.orgId, orgId))
      .orderBy(desc(billingInvoices.createdAt))
      .limit(24);

    res.json({ data: localInvoices });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/payment-method", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ paymentMethod: null });

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    const stripe = await getStripeClient();

    if (!stripe || !sub?.stripeCustomerId) {
      return res.json({ paymentMethod: null });
    }

    const methods = await stripe.paymentMethods.list({
      customer: sub.stripeCustomerId,
      type: "card",
      limit: 1,
    });

    if (methods.data.length === 0) {
      return res.json({ paymentMethod: null });
    }

    const pm = methods.data[0];
    res.json({
      paymentMethod: {
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/alerts", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ data: [] });

    const alerts = await db.select().from(billingAlerts)
      .where(and(eq(billingAlerts.orgId, orgId), eq(billingAlerts.acknowledged, false)))
      .orderBy(desc(billingAlerts.createdAt));

    res.json({ data: alerts });
  } catch (error) {
    next(error);
  }
});

router.post("/billing/alerts/:id/acknowledge", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const alertId = parseInt(String(req.params.id));
    const [alert] = await db.select().from(billingAlerts)
      .where(and(eq(billingAlerts.id, alertId), eq(billingAlerts.orgId, orgId)));
    if (!alert) throw AppError.notFound("Alert not found");

    await db.update(billingAlerts).set({ acknowledged: true }).where(eq(billingAlerts.id, alertId));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/billing/overage-estimate", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ overages: [], totalEstimate: 0 });

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    const plan = sub?.plan || "trial";
    const overageRates = getPlanOverageRates(plan);
    const dimensions = await getUsageSummary(orgId);

    const overages = dimensions
      .filter((d) => d.isOverLimit)
      .map((d) => {
        const overAmount = d.used - d.limit;
        const rate = overageRates[d.dimension as keyof typeof overageRates] || 0;
        return {
          dimension: d.dimension,
          overAmount,
          rate,
          estimatedCharge: Math.round(overAmount * rate * 100) / 100,
        };
      });

    res.json({
      overages,
      totalEstimate: overages.reduce((sum, o) => sum + o.estimatedCharge, 0),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/billing/webhook", async (req: Request, res: Response) => {
  try {
    const stripe = await getStripeClient();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(200).json({ received: true });
    }

    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error({ err }, "Stripe webhook signature verification failed");
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = parseInt(session.metadata?.orgId || "0");
        const plan = session.metadata?.plan || "starter";
        const billingCycle = session.metadata?.billingCycle || "monthly";

        if (orgId) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1));

          await db.update(billingSubscriptions).set({
            plan,
            status: "active",
            billingCycle,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            allocations: getPlanLimits(plan),
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            failedPaymentCount: 0,
            lastPaymentError: null,
            graceEndsAt: null,
            suspendedAt: null,
            updatedAt: now,
          }).where(eq(billingSubscriptions.orgId, orgId));

          logger.info({ orgId, plan }, "Subscription activated via checkout");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        const updates: Record<string, unknown> = { updatedAt: new Date() };
        if (status === "active") updates.status = "active";
        if (status === "past_due") updates.status = "past_due";
        if (status === "unpaid") updates.status = "unpaid";
        if (subscription.cancel_at_period_end) updates.cancelAtPeriodEnd = true;

        if (subscription.current_period_start) {
          updates.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        }
        if (subscription.current_period_end) {
          updates.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }

        await db.update(billingSubscriptions).set(updates)
          .where(eq(billingSubscriptions.stripeCustomerId, customerId));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        await db.update(billingSubscriptions).set({
          status: "canceled",
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        }).where(eq(billingSubscriptions.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        await db.update(billingSubscriptions).set({
          failedPaymentCount: 0,
          lastPaymentError: null,
          graceEndsAt: null,
          updatedAt: new Date(),
        }).where(eq(billingSubscriptions.stripeCustomerId, customerId));

        const [sub] = await db.select().from(billingSubscriptions)
          .where(eq(billingSubscriptions.stripeCustomerId, customerId));

        if (sub) {
          await db.insert(billingInvoices).values({
            orgId: sub.orgId,
            stripeInvoiceId: invoice.id,
            amountDue: invoice.amount_due,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
            description: `Payment for ${sub.plan} plan`,
            invoiceUrl: invoice.hosted_invoice_url,
            pdfUrl: invoice.invoice_pdf,
            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
            paidAt: new Date(),
          });
        }

        logger.info({ customerId }, "Invoice payment succeeded");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const [sub] = await db.select().from(billingSubscriptions)
          .where(eq(billingSubscriptions.stripeCustomerId, customerId));

        if (sub) {
          const failCount = (sub.failedPaymentCount || 0) + 1;
          const updates: Record<string, unknown> = {
            failedPaymentCount: failCount,
            lastPaymentError: invoice.last_finalization_error?.message || "Payment failed",
            status: "past_due",
            updatedAt: new Date(),
          };

          if (failCount === 1) {
            const graceEnd = new Date();
            graceEnd.setDate(graceEnd.getDate() + DUNNING_CONFIG.gracePeriodDays);
            updates.graceEndsAt = graceEnd;
          }

          if (failCount >= DUNNING_CONFIG.maxRetries) {
            updates.status = "suspended";
            updates.suspendedAt = new Date();
            logger.warn({ orgId: sub.orgId, failCount }, "Subscription suspended after max retries");
          }

          await db.update(billingSubscriptions).set(updates)
            .where(eq(billingSubscriptions.stripeCustomerId, customerId));

          await db.insert(billingInvoices).values({
            orgId: sub.orgId,
            stripeInvoiceId: invoice.id,
            amountDue: invoice.amount_due,
            amountPaid: 0,
            currency: invoice.currency,
            status: "failed",
            description: `Failed payment for ${sub.plan} plan (attempt ${failCount})`,
          });

          publishEvent(sub.orgId, "notifications", "notification:new", {
            type: "payment_failed",
            failCount,
            graceEndsAt: sub.graceEndsAt,
          });
        }

        logger.warn({ customerId }, "Invoice payment failed");
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook processing error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

async function directActivation(orgId: number, plan: PlanId, billingCycle: string) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1));

  const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
  const values = {
    plan,
    status: "active" as const,
    billingCycle,
    allocations: getPlanLimits(plan),
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    failedPaymentCount: 0,
    lastPaymentError: null,
    graceEndsAt: null,
    suspendedAt: null,
    updatedAt: now,
  };

  if (sub) {
    const [updated] = await db.update(billingSubscriptions).set(values)
      .where(eq(billingSubscriptions.orgId, orgId)).returning();
    return updated;
  }

  const [created] = await db.insert(billingSubscriptions).values({ orgId, ...values }).returning();
  return created;
}

export default router;
