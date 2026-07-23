import { z } from "zod";

import { CURRENCIES } from "@freelo/shared/data/currencies";
import { TIMEZONES } from "@freelo/shared/data/timezones";

const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code) as [
  string,
  ...string[],
];

const TIMEZONE_VALUES = TIMEZONES.map((timezone) => timezone.value) as [
  string,
  ...string[],
];

export const studioSchema = z.object({
  logo: z.string().nullable().optional(),

  studioName: z.string().trim().min(2, "Studio name is required").max(120),

  ownerName: z.string().trim().min(2, "Owner name is required").max(120),

  timezone: z.enum(TIMEZONE_VALUES, {
    message: "Please select a valid timezone.",
  }),

  professionalEmail: z.string().trim().email("Invalid email"),

  currency: z.enum(CURRENCY_CODES, {
    message: "Please select a valid currency.",
  }),
});

export type StudioRequest = z.infer<typeof studioSchema>;
