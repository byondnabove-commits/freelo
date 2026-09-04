import { z } from "zod";

export const UpdateOrgPreferencesSchema = z.object({
  autoConvertLeadsOnWon: z.boolean(),
});

export type UpdateOrgPreferencesInput = z.infer<typeof UpdateOrgPreferencesSchema>;