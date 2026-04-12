import { Router } from "express";
import { db } from "@workspace/db";
import { users, organizations } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";
import { validate, paginationQuery } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { checkPlanLimit, checkAllCountBasedLimits, recordUsage } from "../lib/billing/metering";

const router = Router();

router.get("/users/me", requireAuth, async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;
    if (!clerkUserId) throw new AppError(401, "UNAUTHORIZED", "Unauthorized");

    let [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      const orgId = auth?.orgId;
      let dbOrgId: number | null = null;
      if (orgId) {
        let [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgId));
        if (!org) {
          [org] = await db.insert(organizations).values({
            clerkOrgId: orgId,
            name: "My Organization",
            slug: orgId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          }).returning();
        }
        dbOrgId = org.id;
      }

      if (dbOrgId) {
        const { allowed, used, limit } = await checkPlanLimit(dbOrgId, "users");
        if (!allowed) {
          res.status(403).json({
            error: "User seat limit reached",
            code: "PLAN_LIMIT_EXCEEDED",
            details: { dimension: "users", used, limit },
            upgradeUrl: "/billing",
            message: `Your organization has reached its user limit (${used}/${limit}). Upgrade your plan to add more team members.`,
          });
          return;
        }
      }

      const claims = auth?.sessionClaims as Record<string, unknown> | undefined;
      const email = (claims?.email as string)
        || (claims?.primary_email_address as string)
        || `${clerkUserId}@nexushr.ai`;
      const firstName = (claims?.first_name as string) || (claims?.given_name as string) || null;
      const lastName = (claims?.last_name as string) || (claims?.family_name as string) || null;

      [user] = await db.insert(users).values({
        clerkUserId,
        orgId: dbOrgId,
        email,
        firstName,
        lastName,
      }).returning();

      if (dbOrgId) {
        await recordUsage(dbOrgId, "users", 1, { clerkUserId, email });
        await checkAllCountBasedLimits(dbOrgId);
      }
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/users", requireAuth, validate({ query: paginationQuery }), async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const orgId = auth?.orgId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    if (!orgId) {
      res.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      return;
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgId));
    if (!org) {
      res.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      return;
    }

    const where = eq(users.orgId, org.id);
    const data = await db.select().from(users).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
