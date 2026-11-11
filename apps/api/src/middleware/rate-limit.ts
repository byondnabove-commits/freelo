import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import { AppError } from "../lib/errors";

// Caddy sets X-Forwarded-For in production; fall back to the socket address locally.
function clientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || getConnInfo(c).remote.address || "unknown";
}

// shortcut: in-memory store, correct only with a single API process. Move to a Postgres or Redis store before running several instances.
export const rateLimit = (limit: number, windowMs = 60_000) =>
  rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: clientIp,
    handler: () => {
      throw new AppError("RATE_LIMITED", 429, "Too many requests");
    },
  });
