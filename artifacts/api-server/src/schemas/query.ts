import { z } from "zod/v4";
import { paginationQuery } from "../middlewares/validate";

export const listRolesQuery = paginationQuery.extend({
  category: z.string().optional(),
  industry: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["relevance", "price_asc", "price_desc", "newest"])
    .optional(),
});

export const listTasksQuery = paginationQuery.extend({
  status: z
    .enum(["pending", "in_progress", "completed", "failed", "cancelled"])
    .optional(),
  assigneeId: z.coerce.number().int().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});
