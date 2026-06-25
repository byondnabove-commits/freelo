import { Hono } from "hono";
import type { AppEnv } from "@/types/hono";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { organization, member } from "@/db/schema/auth";

import { organizationProfile, subscription } from "@/db/schema";

import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";

const me = new Hono<AppEnv>();

me.get("/", requireAuth, requireOrg, async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const currentOrganization = c.get("organization");
  const currentMember = c.get("member");

  const [profile] = await db
    .select()
    .from(organizationProfile)
    .where(eq(organizationProfile.organizationId, currentOrganization.id))
    .limit(1);

  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, currentOrganization.id))
    .limit(1);

  return c.json({
    data: {
      user,
      session,
      organization: currentOrganization,
      member: currentMember,
      organizationProfile: profile ?? null,
      subscription: currentSubscription ?? null,
    },
  });
});

export default me;