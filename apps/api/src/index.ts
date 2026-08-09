import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");
import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "@/types/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { handleAppError } from "@/lib/http-errors";

import { auth } from "./auth";

import { leadRoutes } from "./modules/leads";
import { formRoutes } from "./modules/forms";
import { clientRoutes } from "./modules/clients";

import meRoutes from "./routes/me";
import onboardingRoutes from "./routes/onboarding";
import upload from "./routes/upload";
// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const app = new Hono<AppEnv>();

// -----------------------------------------------------------------------------
// Global Middleware
// -----------------------------------------------------------------------------

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL!,
    credentials: true,

    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  "/uploads/*",
  serveStatic({
    root: "./",
  }),
);

// -----------------------------------------------------------------------------
// Better Auth Session Bootstrap
// -----------------------------------------------------------------------------

app.use("*", async (c, next) => {
  // Better Auth handles sessions internally on its own routes (sign-in,
  // callback, sign-out, get-session, etc). Running a full getSession() here
  // too just adds a redundant DB round-trip in front of every auth request
  // (sign-in/social, callback, ...), which is what was causing the multi-second
  // delay before the Google redirect actually fired.
  if (c.req.path.startsWith("/api/auth")) {
    await next();
    return;
  }

  const result = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!result) {
    c.set("user", null);
    c.set("session", null);

    await next();
    return;
  }

  c.set("user", result.user);
  c.set("session", result.session);

  await next();
});

// -----------------------------------------------------------------------------
// Better Auth Routes
// -----------------------------------------------------------------------------

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// -----------------------------------------------------------------------------
// Security Headers
// -----------------------------------------------------------------------------

app.use("/api/me", secureHeaders());
app.use("/api/leads/*", secureHeaders());
app.use("/health", secureHeaders());
app.use("/api/onboarding", secureHeaders());

// -----------------------------------------------------------------------------
// Feature Routes
// -----------------------------------------------------------------------------

app.route("/api/leads", leadRoutes);
app.route("/api/me", meRoutes);
app.route("/api/onboarding", onboardingRoutes);
app.route("/api/upload", upload);
app.route("/api/forms", formRoutes);
app.route("/api/clients", clientRoutes);

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------
app.onError((err, c) => handleAppError(err, c));

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------

app.get("/health", (c) =>
  c.json({
    status: "ok",
    time: new Date().toISOString(),
  }),
);

const PORT = Number(process.env.PORT) || 3001;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  },
);

export type AppType = typeof app;
