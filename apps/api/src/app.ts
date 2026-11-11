import { sql } from "@freelo/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId, type RequestIdVariables } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import { db } from "./db";
import { env } from "./env";
import { handleError, handleNotFound } from "./lib/errors";
import { rateLimit } from "./middleware/rate-limit";

export type AppEnv = { Variables: RequestIdVariables };

// Pipeline order follows 02-architecture.md §3.3. Auth and org middleware arrive in S1.
const app = new Hono<AppEnv>()
  .use(requestId())
  .use(logger())
  .use(secureHeaders())
  .use(
    "/api/*",
    cors({
      origin: env.WEB_URL,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Idempotency-Key"],
    }),
  )
  .use("/api/v1/public/*", rateLimit(60))
  .get("/health", async (c) => {
    try {
      await db.execute(sql`select 1`);
      return c.json({ data: { status: "ok", db: "ok" } });
    } catch {
      return c.json({ data: { status: "degraded", db: "unreachable" } }, 503);
    }
  });

app.onError(handleError);
app.notFound(handleNotFound);

export { app };
export type AppType = typeof app;
