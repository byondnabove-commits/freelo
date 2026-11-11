import { createDb } from "@freelo/db";

import { env } from "./env";

export const { db, close: closeDb } = createDb(env.DATABASE_URL);
