import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// All apps share the root .env in development. In production, real env vars are used.
const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

// The process refuses to start if a variable is missing (02-architecture.md §16).
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  API_PORT: z.coerce.number().int().default(3001),
  WEB_URL: z.url(),
});

export const env = envSchema.parse(process.env);
