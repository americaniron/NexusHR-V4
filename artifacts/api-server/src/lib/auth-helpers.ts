import { db } from "@workspace/db";
import { organizations, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import type { Request } from "express";

export interface AuthContext {
  orgId: number | null;
  userId: number | null;
  clerkUserId: string | null;
  clerkOrgId: string | null;
  isOwner: boolean;
}

function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAILS || "";
  return raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId ?? null;
  const clerkOrgId = auth?.orgId ?? null;

  let orgId: number | null = null;
  let userId: number | null = null;
  let isOwner = false;

  if (clerkOrgId) {
    const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
    orgId = org?.id ?? null;
  }

  if (clerkUserId) {
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
    userId = user?.id ?? null;
    if (user?.email) {
      isOwner = getOwnerEmails().includes(user.email.toLowerCase());
    }
    if (!orgId && user?.orgId) {
      orgId = user.orgId;
    }
  }

  return { orgId, userId, clerkUserId, clerkOrgId, isOwner };
}

export function emptyPagination(page = 1, limit = 12) {
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}
