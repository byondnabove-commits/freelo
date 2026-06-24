import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { auth } from "./auth";

import leadsRoutes from "./routes/leads";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;

  session:
    | (typeof auth.$Infer.Session.session & {
        activeOrganizationId?: string | null;
      })
    | null;
};

const app = new Hono<{
  Variables: AppVariables;
}>();

// -----------------------------------------------------------------------------
// Global Middleware
// -----------------------------------------------------------------------------

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL!,
    credentials: true,

    allowMethods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

// -----------------------------------------------------------------------------
// Better Auth Session Bootstrap
// -----------------------------------------------------------------------------

app.use("*", async (c, next) => {
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

app.on(
  ["GET", "POST"],
  "/api/auth/*",
  (c) => auth.handler(c.req.raw),
);

app.get("/debug-env", (c) => {
  return c.json({
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    clientUrl: process.env.CLIENT_URL,
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });
});
// -----------------------------------------------------------------------------
// Security Headers
// -----------------------------------------------------------------------------

app.use("/api/me", secureHeaders());
app.use("/api/leads/*", secureHeaders());
app.use("/health", secureHeaders());

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------

app.get("/health", (c) =>
  c.json({
    status: "ok",
    time: new Date().toISOString(),
  }),
);

// -----------------------------------------------------------------------------
// Temporary Session Debug Route
// Remove after GET /me is implemented
// -----------------------------------------------------------------------------

app.get("/api/session", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json(
      {
        error: "Unauthorized",
      },
      401,
    );
  }

  return c.json({
    user,
    session,
  });
});

// -----------------------------------------------------------------------------
// Feature Routes
// -----------------------------------------------------------------------------

app.route("/api/leads", leadsRoutes);


// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------

const PORT = Number(process.env.PORT) || 3001;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => {
    console.log(
      `🚀 API running on http://localhost:${PORT}`,
    );
  },
);

export type AppType = typeof app;