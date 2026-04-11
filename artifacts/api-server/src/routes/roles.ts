import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db";
import { eq, sql, ilike, and, asc, desc } from "drizzle-orm";

const router = Router();

router.get("/roles", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const { category, industry, search, sortBy } = req.query;

    let conditions: any[] = [eq(aiEmployeeRoles.isActive, 1)];
    if (category) conditions.push(eq(aiEmployeeRoles.category, category as string));
    if (industry) conditions.push(eq(aiEmployeeRoles.industry, industry as string));
    if (search) conditions.push(ilike(aiEmployeeRoles.title, `%${search}%`));

    const where = and(...conditions);

    let orderBy: any = desc(aiEmployeeRoles.rating);
    if (sortBy === "price_asc") orderBy = asc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "price_desc") orderBy = desc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "newest") orderBy = desc(aiEmployeeRoles.createdAt);

    const data = await db.select().from(aiEmployeeRoles).where(where).orderBy(orderBy).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(aiEmployeeRoles).where(where);

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list roles" });
  }
});

router.get("/roles/categories", async (_req, res) => {
  try {
    const data = await db.select({
      category: aiEmployeeRoles.category,
      count: sql<number>`count(*)`,
    }).from(aiEmployeeRoles).where(eq(aiEmployeeRoles.isActive, 1)).groupBy(aiEmployeeRoles.category);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.get("/roles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, id));
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Failed to get role" });
  }
});

export default router;
