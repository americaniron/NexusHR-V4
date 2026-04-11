import { Router } from "express";
import { db } from "@workspace/db";
import { notifications, organizations, users } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

async function getUserId(req: any): Promise<number | null> {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;
  if (!clerkUserId) return null;
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return user?.id || null;
}

router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }, unreadCount: 0 });

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
    const id = parseInt(req.params.id);
    const [updated] = await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification" });
  }
});

router.post("/notifications/read-all", requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.json({ success: true });

    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all notifications" });
  }
});

export default router;
