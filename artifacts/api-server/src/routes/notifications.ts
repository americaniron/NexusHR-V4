import { Router } from "express";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";
import { validate, paginationQuery, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";

const router = Router();

router.get("/notifications", requireAuth, validate({ query: paginationQuery }), async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) return res.json({ ...emptyPagination(), unreadCount: 0 });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    const where = eq(notifications.userId, userId);
    const data = await db.select().from(notifications).where(where).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(where);
    const [{ unread }] = await db.select({ unread: sql<number>`count(*)` }).from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

    res.json({
      data,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
      unreadCount: Number(unread),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/notifications/:id/read", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    if (!existing) throw AppError.notFound("Notification not found");

    const [updated] = await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).returning();
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post("/notifications/read-all", requireAuth, async (req, res, next) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) return res.json({ success: true });

    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
