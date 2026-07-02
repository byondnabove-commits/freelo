import { createMiddleware } from "hono/factory";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import type { AuthEnv, OrgEnv } from "@/types/hono";

export const requireOrg = createMiddleware<AuthEnv & OrgEnv>(
  async (c, next) => {
    const user = c.get("user");
    const session = c.get("session");

    const context = await getOrganizationContext(user, session);

    if (context.requiresOrganizationSelection) {
      return c.json(
        {
          error: {
            code: "ORGANIZATION_SELECTION_REQUIRED",
            message: "Organization selection required",
          },
        },
        409,
      );
    }

    if (
      !context.organization ||
      !context.member ||
      !context.organizationId
    ) {
      return c.json(
        {
          error: {
            code: "NO_ACTIVE_ORGANIZATION",
            message: "No active organization",
          },
        },
        403,
      );
    }

    c.set("organization", context.organization);
    c.set("member", context.member);
    c.set("organizationId", context.organizationId);

    await next();
  },
);