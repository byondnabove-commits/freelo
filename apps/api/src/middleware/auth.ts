import { createMiddleware } from "hono/factory";
import { auth } from "../auth";

// 1. Explicitly type your context variables for downstream autocomplete
type AuthEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session & {
      activeOrganizationId?: string | null;
    };
  };
};

/**
 * requireAuth - Secure Session Validation
 */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

/**
 * requireOrg - Tamper-proof Organization Context Verification
 */
export const requireOrg = createMiddleware<AuthEnv>(async (c, next) => {
  const session = c.get("session");

  // Secure: Sourced straight from the authenticated server session token
  if (!session?.activeOrganizationId) {
    return c.json({ error: "No active organization" }, 403);
  }

  await next();
});
