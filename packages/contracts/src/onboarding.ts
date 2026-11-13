import { z } from "zod";

import { workspaceNameSchema } from "./auth";

// Onboarding (04-s2 §4). Money is integer centimes (DZD).

export const TEAM_SIZES = ["solo", "small_team", "agency"] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export const BUDGET_BRACKETS = ["under_50k", "50k_150k", "150k_500k", "over_500k", "varies"] as const;
export type BudgetBracket = (typeof BUDGET_BRACKETS)[number];

export const SERVICE_UNITS = ["project", "day", "month", "item"] as const;
export type ServiceUnit = (typeof SERVICE_UNITS)[number];

/** Suggested service chips; labels live in the web i18n files (`onboarding.services.chips.<key>`). */
export const SERVICE_SUGGESTIONS = [
  "brandIdentity",
  "logo",
  "website",
  "socialMedia",
  "uiux",
  "photography",
  "video",
  "copywriting",
  "print",
] as const;

export const MAX_ONBOARDING_SERVICES = 20;
export const MAX_ONBOARDING_INVITES = 5;
/** 100 million DA, in centimes: far above any freelance price, catches typos. */
const MAX_PRICE = 100_000_000_00;

export const businessStepSchema = z.object({ name: workspaceNameSchema });

export const serviceInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  price: z.number().int().min(0).max(MAX_PRICE).nullable(),
  unit: z.enum(SERVICE_UNITS).default("project"),
});
export type ServiceInput = z.infer<typeof serviceInputSchema>;

export const servicesStepSchema = z.object({
  services: z.array(serviceInputSchema).max(MAX_ONBOARDING_SERVICES),
});

export const workStepSchema = z.object({
  teamSize: z.enum(TEAM_SIZES).nullable(),
  typicalBudget: z.enum(BUDGET_BRACKETS).nullable(),
  invites: z.array(z.email().trim().toLowerCase()).max(MAX_ONBOARDING_INVITES).default([]),
});
export type WorkStep = z.infer<typeof workStepSchema>;

/** GET /api/v1/onboarding. `step` = last confirmed step (0 before step 1). */
export type OnboardingState = {
  step: 0 | 1 | 2 | 3;
  completed: boolean;
  business: { name: string; logoUrl: string | null } | null;
  services: (ServiceInput & { id: string })[];
  work: { teamSize: TeamSize | null; typicalBudget: BudgetBracket | null };
};

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
