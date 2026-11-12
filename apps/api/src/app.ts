import { sql } from "@freelo/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

import type { AppEnv } from "./app-env";
import { auth } from "./auth";
import { db } from "./db";
import { env } from "./env";
import { handleError, handleNotFound } from "./lib/errors";
import { loadSession } from "./middleware/auth";
import { rateLimit } from "./middleware/rate-limit";
import { logoRoutes, onboardingRoutes, publicLogoRoutes } from "./modules/profile/routes";
import { meRoutes, publicInvitationRoutes, workspaceRoutes } from "./modules/workspace/routes";

export type { AppEnv };

// Pipeline order follows 02-architecture.md §3.3.
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
  // Better Auth: sign-up, sign-in, sessions, verification, password reset (its own rate limits).
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .use("/api/v1/public/*", rateLimit(60))
  .use("/api/v1/*", loadSession)
  .route("/api/v1/public/invitations", publicInvitationRoutes)
  .route("/api/v1/public/logos", publicLogoRoutes)
  .route("/api/v1", meRoutes)
  .route("/api/v1/onboarding", onboardingRoutes)
  .route("/api/v1/workspace/logo", logoRoutes)
  .route("/api/v1/workspace", workspaceRoutes)
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
