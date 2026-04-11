import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    next(new AppError(401, "UNAUTHORIZED", "Unauthorized"));
    return;
  }
  next();
};
