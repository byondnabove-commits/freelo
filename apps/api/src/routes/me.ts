import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { organization, member } from "@/db/schema/auth";
import { organizationProfile, subscription } from "@/db/schema";
import { requireAuth } from "@/middleware/require-auth";
import type { AppEnv } from "@/types/hono";

const me = new Hono<AppEnv>();

me.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  let organizationId = session.activeOrganizationId ?? null;
  let currentMember = null;

  /**
   * No active organization in the session.
   * Resolve it from memberships.
   */
  if (!organizationId) {
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, user.id));

    // Brand-new account
    if (memberships.length === 0) {
      return c.json({
        data: {
          user,
          session,
          organization: null,
          member: null,
          organizationProfile: null,
          subscription: null,
          isOnboarded: false,
        },
      });
    }

    // Future multi-org support
    if (memberships.length > 1) {
      return c.json({
        data: {
          user,
          session,
          organization: null,
          member: null,
          organizationProfile: null,
          subscription: null,
          requiresOrganizationSelection: true,
          isOnboarded: false,
        },
      });
    }

    currentMember = memberships[0];
    organizationId = currentMember.organizationId;
  } else {
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, user.id),
        ),
      )
      .limit(1);

    if (!membership) {
      return c.json({
        data: {
          user,
          session,
          organization: null,
          member: null,
          organizationProfile: null,
          subscription: null,
          isOnboarded: false,
        },
      });
    }

    currentMember = membership;
  }

  const [currentOrganization] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  const [profile] = await db
    .select()
    .from(organizationProfile)
    .where(eq(organizationProfile.organizationId, organizationId))
    .limit(1);

  const [currentSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, organizationId))
    .limit(1);

  return c.json({
    data: {
      user,
      session,

      organization: currentOrganization ?? null,
      member: currentMember,
      organizationProfile: profile ?? null,
      subscription: currentSubscription ?? null,

      isOnboarded: !!profile?.onboardingCompletedAt,
    },
  });
});

export default me;