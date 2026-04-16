import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

interface ValidationSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string }> = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ field: `params.${issue.path.join(".")}`, message: issue.message });
        }
      }
    }

    if (schemas.query) {
      const schema = schemas.query instanceof z.ZodObject ? schemas.query.passthrough() : schemas.query;
      const result = schema.safeParse(req.query);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ field: `query.${issue.path.join(".")}`, message: issue.message });
        }
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ field: `body.${issue.path.join(".")}`, message: issue.message });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
      });
      return;
    }

    next();
  };
}

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12).optional(),
}).passthrough();

export const idParam = z.object({
  id: z.coerce.number().int().min(1),
});
