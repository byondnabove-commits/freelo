import { z } from "zod";
import {
  LEAD_STATUSES,
  LEAD_LOST_REASONS,
} from "@freelo/shared/db/schema/values.js";

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

export const ListLeadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  // Lost leads are hidden from the default list view. Pass
  // ?includeLost=true to see them.
  includeLost: z.coerce.boolean().optional(),
});

export const UpdateLeadNotesSchema = z.object({
  notes: z.string().trim().max(5000).nullable(),
});

export const ConvertLeadSchema = z.object({
  project: z
    .object({
      name: z.string().trim().min(1),
      description: z.string().trim().nullable().optional(),
      deadline: z.string().trim().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const MarkLeadLostSchema = z.object({
  reason: z.enum(LEAD_LOST_REASONS),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type ListLeadsQueryInput = z.infer<typeof ListLeadsQuerySchema>;
export type UpdateLeadNotesInput = z.infer<typeof UpdateLeadNotesSchema>;
export type ConvertLeadInput = z.infer<typeof ConvertLeadSchema>;
export type MarkLeadLostInput = z.infer<typeof MarkLeadLostSchema>;
