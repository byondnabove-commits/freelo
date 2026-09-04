import { z } from "zod";
import { LEAD_STATUSES } from "@freelo/shared/db/schema/values.js";

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

export const ListLeadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const UpdateLeadNotesSchema = z.object({
  notes: z.string().trim().max(5000).nullable(),
});

// Body for POST /:leadId/convert. `project` absent/null → convert to client
// only (this is what the pre-existing manual "Convert to client" button
// sends). `project` present → also create a starter project in the same
// transaction, using these template fields (this is what the "Won" dialog's
// "Convert & create project" action sends).
export const ConvertLeadSchema = z.object({
  project: z
    .object({
      name: z.string().trim().min(1),
      description: z.string().trim().nullable().optional(),
      deadline: z.string().trim().nullable().optional(), // ISO date string
    })
    .nullable()
    .optional(),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type ListLeadsQueryInput = z.infer<typeof ListLeadsQuerySchema>;
export type UpdateLeadNotesInput = z.infer<typeof UpdateLeadNotesSchema>;
export type ConvertLeadInput = z.infer<typeof ConvertLeadSchema>;
