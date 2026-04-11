import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db";
import { eq, sql, ilike, and, asc, desc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

const router = Router();

router.get("/roles", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const { category, industry, search, sortBy } = req.query;

    const conditions: SQL[] = [eq(aiEmployeeRoles.isActive, 1)];
    if (category) conditions.push(eq(aiEmployeeRoles.category, String(category)));
    if (industry) conditions.push(eq(aiEmployeeRoles.industry, String(industry)));
    if (search) conditions.push(ilike(aiEmployeeRoles.title, `%${String(search)}%`));

    const where = and(...conditions);

    let orderByClause: SQL = desc(aiEmployeeRoles.rating);
    if (sortBy === "price_asc") orderByClause = asc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "price_desc") orderByClause = desc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "newest") orderByClause = desc(aiEmployeeRoles.createdAt);

    const data = await db.select().from(aiEmployeeRoles).where(where).orderBy(orderByClause).limit(limit).offset(offset);
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
    const id = parseInt(String(req.params.id));
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, id));
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Failed to get role" });
  }
});

export default router;
