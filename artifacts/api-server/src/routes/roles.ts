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
    const { page = 1, limit = 12, category, industry, search, sortBy } = req.query as Record<string, unknown>;
    const pageNum = page as number;
    const limitNum = limit as number;
    const offset = (pageNum - 1) * limitNum;

    const conditions: SQL[] = [eq(aiEmployeeRoles.isActive, 1)];
    if (category) conditions.push(eq(aiEmployeeRoles.category, category as string));
    if (industry) conditions.push(eq(aiEmployeeRoles.industry, industry as string));
    if (search) conditions.push(ilike(aiEmployeeRoles.title, `%${search as string}%`));

    const where = and(...conditions);

    let orderByClause: SQL = desc(aiEmployeeRoles.rating);
    if (sortBy === "price_asc") orderByClause = asc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "price_desc") orderByClause = desc(aiEmployeeRoles.priceMonthly);
    else if (sortBy === "newest") orderByClause = desc(aiEmployeeRoles.createdAt);

    const data = await db.select().from(aiEmployeeRoles).where(where).orderBy(orderByClause).limit(limitNum).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(aiEmployeeRoles).where(where);

    res.json({
      data,
      pagination: { page: pageNum, limit: limitNum, total: Number(count), totalPages: Math.ceil(Number(count) / limitNum) },
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
    const id = req.params.id as unknown as number;
    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, id));
    if (!role) throw AppError.notFound("Role not found");
    res.json(role);
  } catch (error) {
    next(error);
  }
});

export default router;
