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
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId ?? null;
  const clerkOrgId = auth?.orgId ?? null;

  let orgId: number | null = null;
  let userId: number | null = null;

  if (clerkOrgId) {
    const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
    orgId = org?.id ?? null;
  }

  if (clerkUserId) {
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
    userId = user?.id ?? null;
  }

  return { orgId, userId, clerkUserId, clerkOrgId };
}

export function emptyPagination(page = 1, limit = 12) {
  return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
}
