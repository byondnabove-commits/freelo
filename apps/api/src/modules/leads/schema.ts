import { z } from "zod";
import { LEAD_STATUSES } from "@freelo/shared/db/schema/values.js";

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

export const ListLeadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// add alongside existing UpdateLeadStatusSchema
export const UpdateLeadNotesSchema = z.object({
  notes: z.string().trim().max(5000).nullable(),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type ListLeadsQueryInput = z.infer<typeof ListLeadsQuerySchema>;
export type UpdateLeadNotesInput = z.infer<typeof UpdateLeadNotesSchema>;