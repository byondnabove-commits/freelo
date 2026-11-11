import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import { AppError } from "../lib/errors";

// Caddy sets X-Forwarded-For in production; fall back to the socket address locally.
function clientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c).remote.address || "unknown";
  } catch {
    return "unknown"; // no socket, e.g. app.request() in tests
  }
}

// shortcut: in-memory store, correct only with a single API process. Move to a Postgres or Redis store before running several instances.
// `key` overrides the default per-IP key (e.g. per workspace).
export const rateLimit = <E extends { Variables: object }>(
  limit: number,
  windowMs = 60_000,
  key: (c: Context<E>) => string = clientIp,
) =>
  rateLimiter<E>({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: key,
    handler: () => {
      throw new AppError("RATE_LIMITED", 429, "Too many requests");
    },
  });
