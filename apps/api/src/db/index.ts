import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@freelo/shared/db/schema/index.js";
import "dotenv/config";

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  ssl: "require",
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
