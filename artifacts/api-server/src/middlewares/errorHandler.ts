import type { Request, Response, NextFunction, RequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static badRequest(message: string) {
    return new AppError(400, "BAD_REQUEST", message);
  }

  static internal(message: string) {
    return new AppError(500, "INTERNAL_ERROR", message);
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: "Not found",
    code: "NOT_FOUND",
    statusCode: 404,
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[ErrorHandler]", err);

  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : message,
    code: "INTERNAL_ERROR",
    statusCode: 500,
  });
}
