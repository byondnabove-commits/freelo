import { runMigrations, schema, sql } from "@freelo/db";
import type { EmailJob } from "@freelo/contracts/jobs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../../app";
import { closeDb, db } from "../../db";
import { jobs } from "../../jobs";
import { hasTestDb } from "../../test/setup";
import { activityService } from "../activity/service";

// End-to-end through HTTP: Better Auth + workspace module + real Postgres (03-s1 §12).
describe.skipIf(!hasTestDb)("auth & workspaces (integration)", () => {
  const sent: EmailJob[] = [];
  const run = `${Date.now()}`;
  let ipCounter = 0;
  const nextIp = () => `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  const email = (name: string) => `${name}-${run}@freelo.test`;
  const PASSWORD = "correct-horse-battery-9";

  beforeAll(async () => {
    await runMigrations(db);
    vi.spyOn(jobs, "enqueueEmail").mockImplementation(async (job) => {
      sent.push(job);
    });
  });

  beforeEach(() => {
    sent.length = 0;
  });

  afterAll(async () => {
    await db.execute(sql`delete from "user" where email like ${`%-${run}@freelo.test`}`);
    await db.execute(sql`delete from organization where name like ${`%${run}%`}`);
    await closeDb();
  });

  type Res = { status: number; body: any; cookie: string };

  async function call(method: string, path: string, opts: { cookie?: string; body?: unknown; ip?: string } = {}): Promise<Res> {
    const res = await app.request(path, {
      method,
      headers: {
        "content-type": "application/json",
        origin: process.env.WEB_URL!,
        "x-forwarded-for": opts.ip ?? nextIp(),
        ...(opts.cookie ? { cookie: opts.cookie } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null, cookie };
  }

  const linkFrom = (job: EmailJob) => {
    const url = new URL(job.text!.split(/\s+/).find((w) => w.startsWith("http"))!);
    return url.pathname + url.search;
  };

  /** Sign up, follow the verification link, return the session cookie. */
  async function verifiedUser(name: string, locale: "en" | "fr" = "en") {
    const addr = email(name);
    const signUp = await call("POST", "/api/auth/sign-up/email", {
      body: { email: addr, password: PASSWORD, name, locale },
    });
    expect(signUp.status).toBe(200);
    const verification = sent.find((j) => j.to === addr)!;
    expect(verification).toBeDefined();
    const res = await app.request(linkFrom(verification), { headers: { "x-forwarded-for": nextIp() } });
    expect([200, 302]).toContain(res.status);
    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    expect(cookie).toContain("session_token");
    return { email: addr, cookie };
  }

  it("signs up, sends the verification email in the chosen language, and the link signs in", async () => {
    const u = await verifiedUser("amine", "fr");
    const me = await call("GET", "/api/v1/me", { cookie: u.cookie });
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ user: { email: u.email, locale: "fr", emailVerified: true }, memberships: [], activeOrganizationId: null });
  });

  it("writes the verification email in French when asked", async () => {
    await call("POST", "/api/auth/sign-up/email", { body: { email: email("fr"), password: PASSWORD, name: "Nour", locale: "fr" } });
    expect(sent.at(-1)?.subject).toContain("Confirmez");
  });

  it("refuses sign-in before email verification", async () => {
    await call("POST", "/api/auth/sign-up/email", { body: { email: email("unverified"), password: PASSWORD, name: "U" } });
    const res = await call("POST", "/api/auth/sign-in/email", { body: { email: email("unverified"), password: PASSWORD } });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("guards business routes: 401 without session, 403 without workspace", async () => {
    expect((await call("GET", "/api/v1/workspace/members")).status).toBe(401);
    const u = await verifiedUser("noworkspace");
    const res = await call("GET", "/api/v1/workspace/members", { cookie: u.cookie });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("NO_ACTIVE_ORGANIZATION");
  });

  it("creates a workspace with an owner and an activity event, and makes it active", async () => {
    const u = await verifiedUser("owner1");
    const created = await call("POST", "/api/v1/workspaces", { cookie: u.cookie, body: { name: `Studio ${run}` } });
    expect(created.status).toBe(201);
    const orgId = created.body.data.organizationId;

    const me = await call("GET", "/api/v1/me", { cookie: u.cookie });
    expect(me.body.data.activeOrganizationId).toBe(orgId);
    expect(me.body.data.memberships).toEqual([{ organizationId: orgId, name: `Studio ${run}`, role: "owner" }]);

    const events = await db.select().from(schema.activityEvents).where(sql`${schema.activityEvents.organizationId} = ${orgId}`);
    expect(events.map((e) => e.type)).toEqual(["workspace.created"]);
  });

  it("leaves nothing behind when the creation transaction fails", async () => {
    const u = await verifiedUser("rollback");
    const spy = vi.spyOn(activityService, "record").mockRejectedValueOnce(new Error("boom"));
    const res = await call("POST", "/api/v1/workspaces", { cookie: u.cookie, body: { name: `Broken ${run}` } });
    spy.mockRestore();
    expect(res.status).toBe(500);
    const orgs = await db.select().from(schema.organization).where(sql`${schema.organization.name} = ${`Broken ${run}`}`);
    expect(orgs).toEqual([]);
  });

  it("never lets a user act on a workspace they don't belong to", async () => {
    const a = await verifiedUser("tenant-a");
    const b = await verifiedUser("tenant-b");
    const orgA = (await call("POST", "/api/v1/workspaces", { cookie: a.cookie, body: { name: `A ${run}` } })).body.data.organizationId;
    await call("POST", "/api/v1/workspaces", { cookie: b.cookie, body: { name: `B ${run}` } });

    const forged = await call("POST", "/api/v1/workspaces/active", { cookie: b.cookie, body: { organizationId: orgA } });
    expect(forged.status).toBe(404);
    const members = await call("GET", "/api/v1/workspace/members", { cookie: b.cookie });
    expect(members.body.data.members.map((m: { email: string }) => m.email)).toEqual([b.email]);
  });

  it("asks to choose when several workspaces and none active", async () => {
    const u = await verifiedUser("multi");
    await call("POST", "/api/v1/workspaces", { cookie: u.cookie, body: { name: `One ${run}` } });
    await call("POST", "/api/v1/workspaces", { cookie: u.cookie, body: { name: `Two ${run}` } });
    await db.execute(sql`update session set active_organization_id = null where user_id = (select id from "user" where email = ${u.email})`);
    const res = await call("GET", "/api/v1/workspace/members", { cookie: u.cookie });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ORGANIZATION_SELECTION_REQUIRED");
  });

  it("invites, refuses another email, and accepts with the invited email", async () => {
    const owner = await verifiedUser("inviter");
    await call("POST", "/api/v1/workspaces", { cookie: owner.cookie, body: { name: `Team ${run}` } });
    const invitee = await verifiedUser("invitee");
    const stranger = await verifiedUser("stranger");

    sent.length = 0;
    const inv = await call("POST", "/api/v1/workspace/invitations", { cookie: owner.cookie, body: { email: invitee.email } });
    expect(inv.status).toBe(201);
    expect(sent[0]).toMatchObject({ to: invitee.email, replyTo: owner.email });
    const id = inv.body.data.id;
    expect(sent[0]!.text).toContain(`/invitations/${id}`);

    const pub = await call("GET", `/api/v1/public/invitations/${id}`);
    expect(pub.body.data).toMatchObject({ organizationName: `Team ${run}`, email: invitee.email, status: "pending" });

    expect((await call("POST", "/api/v1/workspace/invitations", { cookie: owner.cookie, body: { email: invitee.email } })).status).toBe(409);
    expect((await call("POST", `/api/v1/invitations/${id}/accept`, { cookie: stranger.cookie })).status).toBe(403);

    const accepted = await call("POST", `/api/v1/invitations/${id}/accept`, { cookie: invitee.cookie });
    expect(accepted.status).toBe(200);
    const members = await call("GET", "/api/v1/workspace/members", { cookie: owner.cookie });
    expect(members.body.data.members.map((m: { email: string; role: string }) => [m.email, m.role])).toEqual([
      [owner.email, "owner"],
      [invitee.email, "member"],
    ]);
    expect(members.body.data.invitations).toEqual([]);

    // A member can't invite; inviting an existing member conflicts.
    expect((await call("POST", "/api/v1/workspace/invitations", { cookie: invitee.cookie, body: { email: email("x") } })).status).toBe(403);
    expect((await call("POST", "/api/v1/workspace/invitations", { cookie: owner.cookie, body: { email: invitee.email } })).status).toBe(409);
  });

  it("protects the last owner from leaving or being removed", async () => {
    const owner = await verifiedUser("lastowner");
    await call("POST", "/api/v1/workspaces", { cookie: owner.cookie, body: { name: `Solo ${run}` } });
    const leave = await call("POST", "/api/v1/workspace/leave", { cookie: owner.cookie });
    expect(leave.status).toBe(409);
    expect(leave.body.error.code).toBe("LAST_OWNER");

    const members = await call("GET", "/api/v1/workspace/members", { cookie: owner.cookie });
    const removed = await call("DELETE", `/api/v1/workspace/members/${members.body.data.members[0].memberId}`, { cookie: owner.cookie });
    expect(removed.body.error.code).toBe("LAST_OWNER");
  });

  it("answers password reset the same way for known and unknown emails", async () => {
    const u = await verifiedUser("resetme");
    sent.length = 0;
    const known = await call("POST", "/api/auth/request-password-reset", { body: { email: u.email, redirectTo: "/reset-password" } });
    const unknown = await call("POST", "/api/auth/request-password-reset", { body: { email: email("ghost"), redirectTo: "/reset-password" } });
    expect(known.status).toBe(unknown.status);
    expect(known.body).toEqual(unknown.body);
    expect(sent.map((j) => j.to)).toEqual([u.email]);
  });

  it("rate-limits repeated sign-in attempts from one IP", { timeout: 30_000 }, async () => {
    const ip = "192.0.2.77";
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await call("POST", "/api/auth/sign-in/email", { ip, body: { email: email("brute"), password: "wrong-password-123" } })).status);
    }
    expect(statuses).toContain(429);
  });
});
