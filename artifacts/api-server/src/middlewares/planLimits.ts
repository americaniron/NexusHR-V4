import { Request, Response, NextFunction } from "express";
import { getAuthContext } from "../lib/auth-helpers";
import { checkPlanLimit } from "../lib/billing/metering";
import { type BillingDimension } from "../lib/billing/plans";

export function requirePlanLimit(dimension: BillingDimension, quantity: number = 1) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = await getAuthContext(req);
      if (!orgId) {
        return res.status(403).json({
          error: "No organization context",
          code: "NO_ORG",
        });
      }

      const { allowed, used, limit, remaining } = await checkPlanLimit(orgId, dimension, quantity);

      if (!allowed) {
        return res.status(403).json({
          error: `Plan limit exceeded for ${dimension.replace(/_/g, " ")}`,
          code: "PLAN_LIMIT_EXCEEDED",
          details: {
            dimension,
            used,
            limit,
            remaining,
            requested: quantity,
          },
          upgradeUrl: "/billing",
          message: `You've reached your plan limit for ${dimension.replace(/_/g, " ")} (${used}/${limit}). Upgrade your plan to continue.`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
