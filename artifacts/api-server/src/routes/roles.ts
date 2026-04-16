import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db";
import { eq, sql, ilike, and, asc, desc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { validate, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { listRolesQuery } from "../schemas/query";

const router = Router();

router.get("/roles", validate({ query: listRolesQuery }), async (req, res, next) => {
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
    next(error);
  }
});

router.get("/roles/categories", async (_req, res, next) => {
  try {
    const data = await db.select({
      category: aiEmployeeRoles.category,
      count: sql<number>`count(*)`,
    }).from(aiEmployeeRoles).where(eq(aiEmployeeRoles.isActive, 1)).groupBy(aiEmployeeRoles.category);

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/roles/:id", validate({ params: idParam }), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id));
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, id));
    if (!role) throw AppError.notFound("Role not found");
    res.json(role);
  } catch (error) {
    next(error);
  }
});

export default router;
