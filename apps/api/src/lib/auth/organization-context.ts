import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { member, organization } from "@freelo/shared/db/schema/auth.js";
import type { AppVariables, Member, Organization } from "@/types/hono";

type User = NonNullable<AppVariables["user"]>;
type Session = NonNullable<AppVariables["session"]>;

export type OrganizationContext = {
  organizationId: string | null;
  organization: Organization | null;
  member: Member | null;
  requiresOrganizationSelection: boolean;
};

const EMPTY_CONTEXT: OrganizationContext = {
  organizationId: null,
  organization: null,
  member: null,
  requiresOrganizationSelection: false,
};

export async function getOrganizationContext(
  user: User,
  session: Session,
): Promise<OrganizationContext> {
  let organizationId = session.activeOrganizationId ?? null;
  let currentMember: Member | null = null;

  if (!organizationId) {
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, user.id));

    if (memberships.length === 0) {
      return EMPTY_CONTEXT;
    }

    if (memberships.length > 1) {
      return {
        ...EMPTY_CONTEXT,
        requiresOrganizationSelection: true,
      };
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
      return EMPTY_CONTEXT;
    }

    currentMember = membership;
  }

  const [currentOrganization] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (!currentOrganization) {
    return EMPTY_CONTEXT;
  }

  return {
    organizationId,
    organization: currentOrganization,
    member: currentMember,
    requiresOrganizationSelection: false,
  };
}
