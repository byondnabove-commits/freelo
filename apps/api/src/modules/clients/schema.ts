import { z } from "zod";

export const UpdateClientSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  company: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const ListClientsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ListClientsQueryInput = z.infer<typeof ListClientsQuerySchema>;