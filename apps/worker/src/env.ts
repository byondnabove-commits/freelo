import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url(),
    EMAIL_PROVIDER: z.enum(["smtp", "resend"]).default("smtp"),
    EMAIL_FROM: z.string().min(3),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().int().default(1025),
    RESEND_API_KEY: z.string().optional(),
  })
  .refine((e) => e.EMAIL_PROVIDER !== "resend" || e.RESEND_API_KEY, {
    message: "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
    path: ["RESEND_API_KEY"],
  });

export type WorkerEnv = z.infer<typeof envSchema>;

export const loadEnv = (): WorkerEnv => envSchema.parse(process.env);
