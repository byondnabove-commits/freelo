import { z } from "zod";

// Stable error codes shared by the API and the web app. The web app maps each
// code to a translated message (i18n key `errors.<code>`).
export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NO_ACTIVE_ORGANIZATION",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "PLAN_LIMIT_REACHED",
  "INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
