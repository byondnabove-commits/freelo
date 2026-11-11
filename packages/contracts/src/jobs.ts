import { z } from "zod";

// Queue names and payload schemas shared by the API (producer) and the worker (consumer).
// Every payload is validated again by the worker before use.

export const QUEUES = { email: "email" } as const;

export const emailJobSchema = z.object({
  to: z.email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.email().optional(),
});
export type EmailJob = z.infer<typeof emailJobSchema>;
