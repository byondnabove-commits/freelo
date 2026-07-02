import { Hono } from "hono";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organizationProfile, subscription } from "@/db/schema";
import { requireAuth } from "@/middleware/require-auth";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import type { AppEnv } from "@/types/hono";

const me = new Hono<AppEnv>();

me.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  const publicSession = {
    id: session.id,
    expiresAt: session.expiresAt,
    activeOrganizationId: session.activeOrganizationId ?? null,
  };

  const context = await getOrganizationContext(user, session);

  if (context.requiresOrganizationSelection) {
    return c.json({
      data: {
        user,
        session: publicSession,
        organization: null,
        member: null,
        organizationProfile: null,
        subscription: null,
        requiresOrganizationSelection: true,
        isOnboarded: false,
      },
    });
  }

  if (!context.organization || !context.member || !context.organizationId) {
    return c.json({
      data: {
        user,
        session: publicSession,
        organization: null,
        member: null,
        organizationProfile: null,
        subscription: null,
        isOnboarded: false,
      },
    });
  }

  const [profile] = await db
    .select()
    .from(organizationProfile)
    .where(eq(organizationProfile.organizationId, context.organizationId))
    .limit(1);

  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, context.organizationId))
    .limit(1);

  return c.json({
    data: {
      user,
      session: publicSession,

      organization: context.organization,
      member: context.member,

      organizationProfile: profile ?? null,
      subscription: currentSubscription ?? null,

      isOnboarded: !!profile?.onboardingCompletedAt,
    },
  });
});

export default me;
