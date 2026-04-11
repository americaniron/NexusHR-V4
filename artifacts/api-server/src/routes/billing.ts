import { Router } from "express";
import { db } from "@workspace/db";
import { billingSubscriptions, usageEvents } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { logger } from "../lib/logger";

const router = Router();

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  trial: { ai_employees: 2, voice_hours: 40, messages: 5000, workflows: 10, tasks: 2000, integrations: 3, storage_gb: 10, users: 3 },
  starter: { ai_employees: 2, voice_hours: 40, messages: 5000, workflows: 10, tasks: 2000, integrations: 5, storage_gb: 10, users: 3 },
  growth: { ai_employees: 10, voice_hours: 200, messages: 25000, workflows: 50, tasks: 15000, integrations: 15, storage_gb: 50, users: 10 },
  business: { ai_employees: 50, voice_hours: 1000, messages: 999999, workflows: 200, tasks: 100000, integrations: 999, storage_gb: 500, users: 50 },
  enterprise: { ai_employees: 999999, voice_hours: 999999, messages: 999999, workflows: 999999, tasks: 999999, integrations: 999, storage_gb: 999999, users: 999999 },
};

const PLAN_PRICING: Record<string, { monthly: number; annual: number; name: string; description: string }> = {
  starter: { monthly: 299, annual: 249, name: "Starter", description: "Perfect for small teams getting started with AI employees" },
  growth: { monthly: 799, annual: 649, name: "Growth", description: "Scale your AI workforce with more capacity and integrations" },
  business: { monthly: 1999, annual: 1599, name: "Business", description: "Enterprise-grade features for larger organizations" },
  enterprise: { monthly: 0, annual: 0, name: "Enterprise", description: "Custom pricing with unlimited resources and dedicated support" },
};

router.get("/billing/plans", requireAuth, async (_req, res, next) => {
  try {
    const plans = Object.entries(PLAN_PRICING).map(([key, pricing]) => ({
      id: key,
      ...pricing,
      limits: PLAN_LIMITS[key],
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
      trialEnd.setDate(trialEnd.getDate() + 14);
      [sub] = await db.insert(billingSubscriptions).values({
        orgId,
        plan: "trial",
        status: "trialing",
        trialEndsAt: trialEnd,
        allocations: PLAN_LIMITS.trial,
      }).returning();
    }

    res.json(sub);
  } catch (error) {
    next(error);
  }
});

router.get("/billing/usage", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.json({ dimensions: [] });

    const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
    const plan = sub?.plan || "trial";
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;

    const periodStart = sub?.currentPeriodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const usageData = await db.select({
      dimension: usageEvents.dimension,
      total: sql<number>`sum(${usageEvents.quantity})`,
    }).from(usageEvents)
      .where(and(eq(usageEvents.orgId, orgId), gte(usageEvents.recordedAt, periodStart)))
      .groupBy(usageEvents.dimension);

    const dimensions = Object.entries(limits).map(([dim, limit]) => {
      const usage = usageData.find(u => u.dimension === dim);
      const used = Number(usage?.total || 0);
      return { dimension: dim, used, limit, percentage: limit > 0 ? Math.round((used / limit) * 100) : 0 };
    });

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

    if (!process.env.STRIPE_SECRET_KEY) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1));

      const [sub] = await db.select().from(billingSubscriptions).where(eq(billingSubscriptions.orgId, orgId));
      if (sub) {
        const [updated] = await db.update(billingSubscriptions).set({
          plan,
          status: "active",
          billingCycle,
          allocations: PLAN_LIMITS[plan],
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        }).where(eq(billingSubscriptions.orgId, orgId)).returning();
        return res.json({ type: "activated", subscription: updated });
      } else {
        const [created] = await db.insert(billingSubscriptions).values({
          orgId,
          plan,
          status: "active",
          billingCycle,
          allocations: PLAN_LIMITS[plan],
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        }).returning();
        return res.json({ type: "activated", subscription: created });
      }
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
    const pricing = PLAN_PRICING[plan];
    const unitAmount = (billingCycle === "annual" ? pricing.annual : pricing.monthly) * 100;

    const session = await stripeClient.checkout.sessions.create({
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          recurring: { interval: billingCycle === "annual" ? "year" : "month" },
          product_data: { name: `NexsusHR ${pricing.name} Plan` },
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || "https://" + process.env.REPLIT_DEV_DOMAIN}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "https://" + process.env.REPLIT_DEV_DOMAIN}/billing?canceled=true`,
      metadata: { orgId: String(orgId), plan, billingCycle },
    });

    res.json({ type: "checkout", url: session.url });
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

    if (!process.env.STRIPE_SECRET_KEY) {
      throw AppError.badRequest("Stripe is not configured.");
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || "https://" + process.env.REPLIT_DEV_DOMAIN}/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    next(error);
  }
});

router.post("/billing/webhook", async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(200).json({ received: true });
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"] as string;
    const event = stripeClient.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = parseInt(session.metadata?.orgId || "0");
        const plan = session.metadata?.plan || "starter";
        const billingCycle = session.metadata?.billingCycle || "monthly";

        if (orgId) {
          await db.update(billingSubscriptions).set({
            plan,
            status: "active",
            billingCycle,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            allocations: PLAN_LIMITS[plan],
            currentPeriodStart: new Date(),
            updatedAt: new Date(),
          }).where(eq(billingSubscriptions.orgId, orgId));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        await db.update(billingSubscriptions).set({
          status: "canceled",
          updatedAt: new Date(),
        }).where(eq(billingSubscriptions.stripeCustomerId, customerId));
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, "Stripe webhook error");
    next(error);
  }
});

export default router;
