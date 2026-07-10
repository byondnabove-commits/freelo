import { z } from "zod";

export const SERVICE_CATEGORIES = [
  "brand_identity",
  "web_design",
  "development",
  "ui_ux_design",
  "motion_video",
  "photography",
  "copywriting",
  "social_media",
  "other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const servicesSchema = z.object({
  serviceCategories: z
    .array(z.enum(SERVICE_CATEGORIES))
    .min(1, "Select at least one service"),

  teamSize: z.enum(["solo", "2_5", "6_15", "16_plus"]),

  averageBudget: z.enum([
    "under_1000",
    "1000_5000",
    "5000_15000",
    "15000_plus",
  ]),
});

export type ServicesRequest = z.infer<typeof servicesSchema>;
