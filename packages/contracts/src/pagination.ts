import { z } from "zod";

// Cursor pagination (02-architecture.md §3.2): default 50, max 100.
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type Page<T> = {
  data: T[];
  page: { nextCursor: string | null; limit: number };
};
