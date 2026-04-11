import { Router } from "express";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext, emptyPagination } from "../lib/auth-helpers";

const router = Router();

router.get("/notifications", requireAuth, async (req, res) => {
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
    res.status(500).json({ error: "Failed to list notifications" });
  }
});

router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    if (!existing) return res.status(404).json({ error: "Notification not found" });

    const [updated] = await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification" });
  }
});

router.post("/notifications/read-all", requireAuth, async (req, res) => {
  try {
    const { userId } = await getAuthContext(req);
    if (!userId) return res.json({ success: true });

    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all notifications" });
  }
});

export default router;
