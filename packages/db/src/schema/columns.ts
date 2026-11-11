import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

import { organization } from "./auth";

// Shared column builders so every business table follows 02-architecture.md §6.

/** UUID v7 primary key, generated in the app (time-ordered: good for indexes and cursors). */
export const id = () =>
  uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7());

/** Tenant column. Every business table has one, and every repository query filters on it. */
export const organizationId = () =>
  text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" });

export const createdAt = () =>
  timestamp({ withTimezone: true }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
