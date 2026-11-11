import type { Role } from "@freelo/contracts/auth";
import { can, type Action } from "@freelo/domain/permissions";
import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../app-env";
import { auth } from "../auth";
import { AppError } from "../lib/errors";
import { workspaceService } from "../modules/workspace/service";

/** Loads the Better Auth session (if any) for every non-auth request. */
export const loadSession = createMiddleware<AppEnv>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", result?.user ?? null);
  c.set("session", result?.session ?? null);
  await next();
});

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user") || !c.get("session")) throw new AppError("UNAUTHENTICATED", 401, "Sign in first");
  await next();
});

/**
 * The active workspace comes from the session only, never from the request, and
 * membership is checked in the database on every request (03-s1 §5).
 */
export const requireOrg = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  const session = c.get("session");
  if (!user || !session) throw new AppError("UNAUTHENTICATED", 401, "Sign in first");

  const active = await workspaceService.resolveActive(user.id, session);
  if (active.status === "select") {
    throw new AppError("ORGANIZATION_SELECTION_REQUIRED", 409, "Choose a workspace");
  }
  if (active.status === "none") throw new AppError("NO_ACTIVE_ORGANIZATION", 403, "Create a workspace first");

  c.set("organizationId", active.organizationId);
  c.set("role", active.role);
  c.set("memberId", active.memberId);
  await next();
});

export const requirePermission = (action: Action) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!can(c.get("role") as Role, action)) throw new AppError("FORBIDDEN", 403, "Not allowed");
    await next();
  });
