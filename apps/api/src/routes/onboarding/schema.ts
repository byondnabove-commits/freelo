// src/routes/onboarding/schema.ts

import { z } from "zod";

export const studioSchema = z.object({
  logo: z.string().nullable().optional(),

  studioName: z
    .string()
    .trim()
    .min(2, "Studio name is required")
    .max(120),

  ownerName: z
    .string()
    .trim()
    .min(2, "Owner name is required")
    .max(120),

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required"),

  professionalEmail: z
    .string()
    .trim()
    .email("Invalid email"),

  currency: z
    .string()
    .trim()
    .min(1, "Currency is required"),
});

export type StudioRequest = z.infer<typeof studioSchema>;