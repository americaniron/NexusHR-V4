import { Router } from "express";
import { db } from "@workspace/db";
import { organizations } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/organizations/current", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = auth?.orgId;
    if (!orgId) {
      return res.status(404).json({ error: "No organization found" });
    }

    let [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgId));

    if (!org) {
      [org] = await db.insert(organizations).values({
        clerkOrgId: orgId,
        name: "My Organization",
        slug: orgId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      }).returning();
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ error: "Failed to get organization" });
  }
});

router.patch("/organizations/current", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = auth?.orgId;
    if (!orgId) {
      return res.status(404).json({ error: "No organization found" });
    }

    const { name, logoUrl, industry, timezone } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (industry !== undefined) updates.industry = industry;
    if (timezone) updates.timezone = timezone;

    const [updated] = await db.update(organizations)
      .set(updates)
      .where(eq(organizations.clerkOrgId, orgId))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update organization" });
  }
});

export default router;
