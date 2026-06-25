// middleware/require-org.ts
import { createMiddleware } from "hono/factory";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { organization, member } from "@/db/schema/auth";
import type { AuthEnv, OrgEnv } from "@/types/hono";

export const requireOrg = createMiddleware<AuthEnv & OrgEnv>(
  async (c, next) => {
    const session = c.get("session");
    const user = c.get("user");

    const organizationId = session.activeOrganizationId;

    if (!organizationId) {
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

    const [currentMember] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, user.id),
        ),
      )
      .limit(1);

    // critical: don't trust activeOrganizationId blindly — confirm membership still exists
    if (!currentMember) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Forbidden",
          },
        },
        403,
      );
    }


    const [currentOrganization] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

   if (!currentOrganization) {
      return c.json(
        {
          error: {
            code: "ORGANIZATION_NOT_FOUND",
            message: "Organization not found",
          },
        },
        404,
      );
    }

    c.set("organization", currentOrganization);
    c.set("member", currentMember);
    c.set("organizationId", organizationId);

    await next();
  },
);
