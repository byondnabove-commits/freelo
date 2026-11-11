import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import * as schema from "./schema/index";

export function createDb(url: string, options: { max?: number } = {}) {
  const client = postgres(url, { max: options.max ?? 10 });
  const db = drizzle(client, { schema, casing: "snake_case" });
  return { db, close: () => client.end() };
}

export type Db = ReturnType<typeof createDb>["db"];
/** A database handle or an open transaction. Services pass `tx` down to repositories. */
export type DbOrTx = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

export { schema };

// Apps import query helpers from here, never from drizzle-orm directly: one
// drizzle-orm copy in the dependency graph keeps column and SQL types compatible.
export * from "drizzle-orm";

/** Applies the committed migrations (tests and the deploy migrate step). */
export const runMigrations = (db: Db) => migrate(db, { migrationsFolder });

/** Absolute path of the committed SQL migrations (used by tests and the deploy migrate step). */
export const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url));
