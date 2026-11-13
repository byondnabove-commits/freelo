import type { Role } from "@freelo/contracts/auth";
import { and, asc, count, eq, schema, sql, type DbOrTx } from "@freelo/db";

const { organization, member, invitation, user, session } = schema;

// Workspace = Better Auth's organization. Every query on member and invitation
// is scoped by organizationId; the few that are scoped by user, session or an
// unguessable invitation id say so with `tenancy-exempt`.
export const workspaceRepository = {
  async insertOrganization(tx: DbOrTx, org: { id: string; name: string; slug: string }) {
    await tx.insert(organization).values(org /* tenancy-exempt: this row is the tenant */);
  },

  /** Every workspace has exactly one profile, created with it (04-s2 §7). */
  async insertProfile(tx: DbOrTx, organizationId: string) {
    await tx.insert(schema.organizationProfile).values({ organizationId });
  },

  async renameOrganization(db: DbOrTx, organizationId: string, name: string) {
    await db.update(organization).set({ name }).where(eq(organization.id, organizationId));
  },

  async insertMember(tx: DbOrTx, organizationId: string, m: { id: string; userId: string; role: Role }) {
    await tx.insert(member).values({ ...m, organizationId });
  },

  async findMembership(db: DbOrTx, organizationId: string, userId: string) {
    const [row] = await db
      .select({ memberId: member.id, role: member.role })
      .from(member)
      .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
      .limit(1);
    return row ? { memberId: row.memberId, role: row.role as Role } : null;
  },

  listMembershipsForUser(db: DbOrTx, userId: string) {
    return db
      .select({ organizationId: organization.id, name: organization.name, role: member.role })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(eq(member.userId, userId) /* tenancy-exempt: a user's own memberships */)
      .orderBy(asc(organization.name));
  },

  async setSessionActiveOrganization(db: DbOrTx, sessionId: string, organizationId: string | null) {
    await db
      .update(session)
      .set({ activeOrganizationId: organizationId })
      .where(eq(session.id, sessionId) /* tenancy-exempt: the caller's own session */);
  },

  listMembers(db: DbOrTx, organizationId: string) {
    return db
      .select({ memberId: member.id, userId: user.id, name: user.name, email: user.email, role: member.role, joinedAt: member.createdAt })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(member.organizationId, organizationId))
      .orderBy(asc(member.createdAt));
  },

  async findMember(db: DbOrTx, organizationId: string, memberId: string) {
    const [row] = await db
      .select({ memberId: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(and(eq(member.organizationId, organizationId), eq(member.id, memberId)))
      .limit(1);
    return row ?? null;
  },

  async countOwners(db: DbOrTx, organizationId: string) {
    const [row] = await db
      .select({ n: count() })
      .from(member)
      .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner")));
    return row?.n ?? 0;
  },

  async deleteMember(db: DbOrTx, organizationId: string, memberId: string) {
    await db.delete(member).where(and(eq(member.organizationId, organizationId), eq(member.id, memberId)));
  },

  async isMemberEmail(db: DbOrTx, organizationId: string, email: string) {
    const [row] = await db
      .select({ id: member.id })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(and(eq(member.organizationId, organizationId), eq(sql`lower(${user.email})`, email.toLowerCase())))
      .limit(1);
    return Boolean(row);
  },

  async insertInvitation(
    tx: DbOrTx,
    organizationId: string,
    inv: { id: string; email: string; role: Role; inviterId: string; expiresAt: Date },
  ) {
    await tx.insert(invitation).values({ ...inv, organizationId, status: "pending" });
  },

  listPendingInvitations(db: DbOrTx, organizationId: string) {
    return db
      .select({ id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt })
      .from(invitation)
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending")))
      .orderBy(asc(invitation.createdAt));
  },

  async findInvitation(db: DbOrTx, organizationId: string, id: string) {
    const [row] = await db
      .select()
      .from(invitation)
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.id, id)))
      .limit(1);
    return row ?? null;
  },

  /** By id alone: the id is the capability sent by email. */
  async findInvitationById(db: DbOrTx, id: string) {
    const [row] = await db
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organizationName: organization.name,
        inviterName: user.name,
      })
      .from(invitation)
      .innerJoin(organization, eq(organization.id, invitation.organizationId))
      .innerJoin(user, eq(user.id, invitation.inviterId))
      .where(eq(invitation.id, id) /* tenancy-exempt: unguessable invitation id */)
      .limit(1);
    return row ?? null;
  },

  async updateInvitation(
    db: DbOrTx,
    organizationId: string,
    id: string,
    set: { status?: "accepted" | "canceled"; expiresAt?: Date },
  ) {
    await db
      .update(invitation)
      .set(set)
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.id, id)));
  },
};
