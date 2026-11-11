import type { Locale, Me, Role } from "@freelo/contracts/auth";
import { invitation as invitationEmail } from "@freelo/templates/email";
import { v7 as uuidv7 } from "uuid";

import { db } from "../../db";
import { env } from "../../env";
import { jobs } from "../../jobs";
import { AppError, notFound } from "../../lib/errors";
import { activityService } from "../activity/service";
import { workspaceRepository as repo } from "./repository";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CurrentUser = { id: string; name: string; email: string; emailVerified: boolean; locale?: unknown };
type CurrentSession = { id: string; activeOrganizationId?: string | null };

export type ActiveWorkspace =
  | { status: "ok"; organizationId: string; role: Role; memberId: string }
  | { status: "none" }
  | { status: "select" };

export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "workspace"}-${suffix}`;
}

const memberActor = (userId: string) => ({ type: "member" as const, id: userId });

export const workspaceService = {
  /**
   * The session's active workspace, checked against the database on every call.
   * With none (or a stale one): exactly one membership is selected automatically.
   */
  async resolveActive(userId: string, session: CurrentSession): Promise<ActiveWorkspace> {
    if (session.activeOrganizationId) {
      const m = await repo.findMembership(db, session.activeOrganizationId, userId);
      if (m) return { status: "ok", organizationId: session.activeOrganizationId, ...m };
    }
    const memberships = await repo.listMembershipsForUser(db, userId);
    if (memberships.length === 0) {
      if (session.activeOrganizationId) await repo.setSessionActiveOrganization(db, session.id, null);
      return { status: "none" };
    }
    if (memberships.length > 1) return { status: "select" };
    const only = memberships[0]!;
    await repo.setSessionActiveOrganization(db, session.id, only.organizationId);
    const m = (await repo.findMembership(db, only.organizationId, userId))!;
    return { status: "ok", organizationId: only.organizationId, ...m };
  },

  async me(user: CurrentUser, session: CurrentSession): Promise<Me> {
    const active = await this.resolveActive(user.id, session);
    const memberships = await repo.listMembershipsForUser(db, user.id);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        locale: (user.locale === "fr" ? "fr" : "en") as Locale,
      },
      memberships: memberships.map((m) => ({ ...m, role: m.role as Role })),
      activeOrganizationId: active.status === "ok" ? active.organizationId : null,
    };
  },

  /** Workspace + owner membership + activity in one transaction, then made active (03-s1 §3.5). */
  async create(user: CurrentUser, sessionId: string, name: string) {
    if (!user.emailVerified) throw new AppError("EMAIL_NOT_VERIFIED", 403, "Verify your email first");
    const organizationId = uuidv7();
    await db.transaction(async (tx) => {
      await repo.insertOrganization(tx, { id: organizationId, name, slug: slugify(name) });
      await repo.insertMember(tx, organizationId, { id: uuidv7(), userId: user.id, role: "owner" });
      await activityService.record(tx, organizationId, {
        actor: memberActor(user.id),
        entity: { type: "workspace", id: organizationId },
        type: "workspace.created",
        data: { name },
      });
    });
    await repo.setSessionActiveOrganization(db, sessionId, organizationId);
    return { organizationId, name };
  },

  async setActive(userId: string, sessionId: string, organizationId: string) {
    const m = await repo.findMembership(db, organizationId, userId);
    if (!m) throw notFound("Workspace");
    await repo.setSessionActiveOrganization(db, sessionId, organizationId);
  },

  async listMembers(organizationId: string) {
    const [members, invitations] = await Promise.all([
      repo.listMembers(db, organizationId),
      repo.listPendingInvitations(db, organizationId),
    ]);
    return { members, invitations };
  },

  async invite(organizationId: string, inviter: CurrentUser, input: { email: string; role: Role }) {
    if (await repo.isMemberEmail(db, organizationId, input.email)) {
      throw new AppError("CONFLICT", 409, "Already a member");
    }
    const id = uuidv7();
    try {
      await db.transaction(async (tx) => {
        await repo.insertInvitation(tx, organizationId, {
          id,
          email: input.email,
          role: input.role,
          inviterId: inviter.id,
          expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        });
        await activityService.record(tx, organizationId, {
          actor: memberActor(inviter.id),
          entity: { type: "invitation", id },
          type: "member.invited",
          data: { email: input.email, role: input.role },
        });
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError("CONFLICT", 409, "Already invited");
      throw err;
    }
    await this.sendInvitationEmail(organizationId, id, inviter);
    return { id };
  },

  // shortcut: enqueued after commit, not inside the transaction; a crash in between loses the email
  // (the owner can resend). Move to transactional enqueue when pg-boss gets a drizzle executor.
  async sendInvitationEmail(organizationId: string, id: string, inviter: CurrentUser) {
    const inv = await repo.findInvitationById(db, id);
    if (!inv || inv.organizationId !== organizationId) throw notFound("Invitation");
    const email = invitationEmail({
      locale: inviter.locale === "fr" ? "fr" : "en",
      inviterName: inviter.name,
      workspaceName: inv.organizationName,
      url: `${env.WEB_URL}/invitations/${id}`,
    });
    await jobs.enqueueEmail({ to: inv.email, replyTo: inviter.email, ...email });
  },

  async cancelInvitation(organizationId: string, id: string) {
    const inv = await repo.findInvitation(db, organizationId, id);
    if (!inv || inv.status !== "pending") throw notFound("Invitation");
    await repo.updateInvitation(db, organizationId, id, { status: "canceled" });
  },

  async resendInvitation(organizationId: string, id: string, inviter: CurrentUser) {
    const inv = await repo.findInvitation(db, organizationId, id);
    if (!inv || inv.status !== "pending") throw notFound("Invitation");
    await repo.updateInvitation(db, organizationId, id, { expiresAt: new Date(Date.now() + INVITATION_TTL_MS) });
    await this.sendInvitationEmail(organizationId, id, inviter);
  },

  async removeMember(organizationId: string, actorUserId: string, memberId: string) {
    await db.transaction(async (tx) => {
      const target = await repo.findMember(tx, organizationId, memberId);
      if (!target) throw notFound("Member");
      if (target.role === "owner" && (await repo.countOwners(tx, organizationId)) <= 1) {
        throw new AppError("LAST_OWNER", 409, "The last owner cannot be removed");
      }
      await repo.deleteMember(tx, organizationId, memberId);
      await activityService.record(tx, organizationId, {
        actor: memberActor(actorUserId),
        entity: { type: "member", id: memberId },
        type: "member.removed",
        data: { userId: target.userId },
      });
    });
  },

  async leave(organizationId: string, userId: string, sessionId: string) {
    await db.transaction(async (tx) => {
      const m = await repo.findMembership(tx, organizationId, userId);
      if (!m) throw notFound("Membership");
      if (m.role === "owner" && (await repo.countOwners(tx, organizationId)) <= 1) {
        throw new AppError("LAST_OWNER", 409, "The last owner cannot leave");
      }
      await repo.deleteMember(tx, organizationId, m.memberId);
      await activityService.record(tx, organizationId, {
        actor: memberActor(userId),
        entity: { type: "member", id: m.memberId },
        type: "member.left",
      });
    });
    await repo.setSessionActiveOrganization(db, sessionId, null);
  },

  /** Public view of an invitation for the accept page. */
  async getInvitation(id: string) {
    const inv = await repo.findInvitationById(db, id);
    if (!inv) throw notFound("Invitation");
    return {
      id: inv.id,
      organizationName: inv.organizationName,
      inviterName: inv.inviterName,
      email: inv.email,
      status: inv.status === "pending" && inv.expiresAt < new Date() ? "expired" : inv.status,
    };
  },

  async acceptInvitation(user: CurrentUser, sessionId: string, id: string) {
    const inv = await repo.findInvitationById(db, id);
    if (!inv || inv.status !== "pending" || inv.expiresAt < new Date()) throw notFound("Invitation");
    if (inv.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new AppError("FORBIDDEN", 403, "This invitation was sent to another email");
    }
    if (!user.emailVerified) throw new AppError("EMAIL_NOT_VERIFIED", 403, "Verify your email first");

    const orgId = inv.organizationId;
    await db.transaction(async (tx) => {
      if (!(await repo.findMembership(tx, orgId, user.id))) {
        const memberId = uuidv7();
        await repo.insertMember(tx, orgId, { id: memberId, userId: user.id, role: (inv.role as Role) ?? "member" });
        await activityService.record(tx, orgId, {
          actor: memberActor(user.id),
          entity: { type: "member", id: memberId },
          type: "member.joined",
          data: { invitationId: id },
        });
      }
      await repo.updateInvitation(tx, orgId, id, { status: "accepted" });
    });
    await repo.setSessionActiveOrganization(db, sessionId, orgId);
    return { organizationId: orgId };
  },
};

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}
