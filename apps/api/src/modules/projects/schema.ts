import { z } from "zod";
import { PROJECT_STAGES } from "@freelo/shared/db/schema/values.js";

export const CreateProjectSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  deadline: z.string().trim().nullable().optional(), // ISO date string
});

export const UpdateProjectStageSchema = z.object({
  stage: z.enum(PROJECT_STAGES),
});

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  deadline: z.string().trim().nullable().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectStageInput = z.infer<typeof UpdateProjectStageSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;