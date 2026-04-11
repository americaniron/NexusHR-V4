import { Router } from "express";
import { db } from "@workspace/db";
import { users, organizations } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;
    if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

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

      [user] = await db.insert(users).values({
        clerkUserId,
        orgId: dbOrgId,
        email: (auth as any)?.sessionClaims?.email || "user@example.com",
        firstName: (auth as any)?.sessionClaims?.firstName || null,
        lastName: (auth as any)?.sessionClaims?.lastName || null,
      }).returning();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.get("/users", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = auth?.orgId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    let conditions: any[] = [];
    if (orgId) {
      const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgId));
      if (org) conditions.push(eq(users.orgId, org.id));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const data = await db.select().from(users).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list users" });
  }
});

export default router;
