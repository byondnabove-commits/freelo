import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// All apps share the root .env in development.
if (existsSync("../../.env")) process.loadEnvFile("../../.env");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
