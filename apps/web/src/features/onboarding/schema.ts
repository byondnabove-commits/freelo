import { z } from "zod";
import { FieldPath } from "react-hook-form";

export const onboardingSchema = z.object({
  // Step 1: Studio Details
  studioName: z.string().min(2, "Studio name must be at least 2 characters"),
  ownerName: z.string().min(2, "Your name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  professionalEmail: z.string().email("Please enter a valid professional email"),
  currency: z.string().min(1, "Currency is required"),
  logo: z.string().optional(),

  // Step 2: Work Characteristics
  serviceCategories: z.array(z.string()).min(1, "Select at least one service feature"),
  teamSize: z.enum(["solo", "2_5", "6_15", "16_plus"]),
  averageBudget: z.enum(["under_1000", "1000_5000", "5000_15000", "15000_plus"]),

  // Step 3: Intake Form Custom Toggles
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

export type OnboardingData = z.infer<typeof onboardingSchema>;

// Fixes Error 1: Replaced 'any' with explicit FieldPath tracking
export const STEP_FIELDS: Array<Array<FieldPath<OnboardingData>>> = [
  ["studioName", "ownerName", "timezone", "professionalEmail", "currency"], 
  ["serviceCategories", "teamSize", "averageBudget"],                             
  [
    "intakeFields.companyName", 
    "intakeFields.projectType", 
    "intakeFields.budgetRange", 
    "intakeFields.preferredTimeline", 
    "intakeFields.projectDescription", 
    "intakeFields.websiteUrl", 
    "intakeFields.attachments", 
    "intakeFields.referralSource"
  ],                                                       
];