import { z } from "zod";

export const intakeFormSchema = z.object({
  intakeFields: z.object({
    companyName: z.boolean(),
    projectType: z.boolean(),
    budgetRange: z.boolean(),
    preferredTimeline: z.boolean(),
    projectDescription: z.boolean(),
    websiteUrl: z.boolean(),
    attachments: z.boolean(),
    referralSource: z.boolean(),
  }),
});

export type IntakeFormRequest = z.infer<typeof intakeFormSchema>;