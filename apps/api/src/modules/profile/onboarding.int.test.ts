import type { EmailJob } from "@freelo/contracts/jobs";
import { runMigrations, schema, sql } from "@freelo/db";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { closeDb, db } from "../../db";
import { jobs } from "../../jobs";
import { call, verifiedUser } from "../../test/http";
import { hasTestDb } from "../../test/setup";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);

// 04-s2 §12 acceptance criteria, through HTTP on a real database.
describe.skipIf(!hasTestDb)("onboarding (integration)", () => {
  const sent: EmailJob[] = [];
  const run = `${Date.now()}`;
  const email = (name: string) => `${name}-${run}@onboarding.test`;

  beforeAll(async () => {
    await runMigrations(db);
    vi.spyOn(jobs, "enqueueEmail").mockImplementation(async (job) => void sent.push(job));
  });

  afterAll(async () => {
    await db.execute(sql`delete from organization where id in (select organization_id from member m join "user" u on u.id = m.user_id where u.email like ${`%-${run}@onboarding.test`})`);
    await db.execute(sql`delete from "user" where email like ${`%-${run}@onboarding.test`}`);
    await closeDb();
  });

  it("walks the 3 steps, resumes at each point, and completes", async () => {
    const u = await verifiedUser(sent, email("owner"));
    const state = async () => (await call("GET", "/api/v1/onboarding", { cookie: u.cookie })).body.data;
    expect(await state()).toMatchObject({ step: 0, business: null });

    // Step 1 creates the workspace (with its profile) and makes it active.
    const s1 = await call("POST", "/api/v1/onboarding/business", { cookie: u.cookie, body: { name: "Studio Nour" } });
    expect(s1.status).toBe(200);
    const orgId = s1.body.data.organizationId;
    expect(await state()).toMatchObject({ step: 1, business: { name: "Studio Nour", logoUrl: null } });
    const me1 = (await call("GET", "/api/v1/me", { cookie: u.cookie })).body.data;
    expect(me1.onboarding).toEqual({ completed: false, step: 1 });

    // Going back to step 1 renames, it never creates a second workspace.
    await call("POST", "/api/v1/onboarding/business", { cookie: u.cookie, body: { name: "Studio Nour Design" } });
    const me2 = (await call("GET", "/api/v1/me", { cookie: u.cookie })).body.data;
    expect(me2.memberships).toEqual([{ organizationId: orgId, name: "Studio Nour Design", role: "owner" }]);

    // Step 2: services with prices in centimes; re-saving replaces the list.
    const services = [
      { name: "Logo", price: 30_000_00, unit: "project" },
      { name: "Website", price: null, unit: "project" },
    ];
    expect((await call("PUT", "/api/v1/onboarding/services", { cookie: u.cookie, body: { services } })).status).toBe(200);
    await call("PUT", "/api/v1/onboarding/services", { cookie: u.cookie, body: { services: [services[0]] } });
    expect((await state()).services).toEqual([expect.objectContaining({ name: "Logo", price: 30_000_00, unit: "project" })]);
    expect((await state()).step).toBe(2);

    // Step 3: team, budget and invitations (a duplicate address is skipped, not an error).
    sent.length = 0;
    const s3 = await call("PUT", "/api/v1/onboarding/work", {
      cookie: u.cookie,
      body: { teamSize: "small_team", typicalBudget: "50k_150k", invites: [email("mate"), email("mate")] },
    });
    expect(s3.status).toBe(200);
    expect(sent.map((j) => j.to)).toEqual([email("mate")]);
    expect((await state()).work).toEqual({ teamSize: "small_team", typicalBudget: "50k_150k" });

    expect((await call("POST", "/api/v1/onboarding/complete", { cookie: u.cookie })).status).toBe(200);
    const me3 = (await call("GET", "/api/v1/me", { cookie: u.cookie })).body.data;
    expect(me3.onboarding).toEqual({ completed: true, step: 3 });
    const events = await db.select().from(schema.activityEvents).where(sql`${schema.activityEvents.organizationId} = ${orgId}`);
    expect(events.map((e) => e.type)).toContain("onboarding.completed");

    // After completion, step 1 creates another workspace instead of renaming this one.
    await call("POST", "/api/v1/onboarding/business", { cookie: u.cookie, body: { name: "Second Studio" } });
    const me4 = (await call("GET", "/api/v1/me", { cookie: u.cookie })).body.data;
    expect(me4.memberships).toHaveLength(2);
  });

  it("never blocks invited members on onboarding", async () => {
    const owner = await verifiedUser(sent, email("o2"));
    await call("POST", "/api/v1/onboarding/business", { cookie: owner.cookie, body: { name: "Unfinished Studio" } });
    const member = await verifiedUser(sent, email("m2"));
    sent.length = 0;
    const inv = await call("POST", "/api/v1/workspace/invitations", { cookie: owner.cookie, body: { email: member.email } });
    await call("POST", `/api/v1/invitations/${inv.body.data.id}/accept`, { cookie: member.cookie });
    const me = (await call("GET", "/api/v1/me", { cookie: member.cookie })).body.data;
    expect(me.onboarding).toEqual({ completed: true, step: 1 });
    // ...and members can't change onboarding answers.
    expect((await call("PUT", "/api/v1/onboarding/services", { cookie: member.cookie, body: { services: [] } })).status).toBe(403);
  });

  it("accepts a real PNG logo and rejects SVG or a renamed file", async () => {
    const u = await verifiedUser(sent, email("logo"));
    const org = (await call("POST", "/api/v1/onboarding/business", { cookie: u.cookie, body: { name: "Logo Studio" } })).body.data.organizationId;

    const upload = (bytes: Uint8Array, name: string, type: string) => {
      const form = new FormData();
      form.append("logo", new File([bytes], name, { type }));
      return call("POST", "/api/v1/workspace/logo", { cookie: u.cookie, form });
    };

    const svg = await upload(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"), "logo.svg", "image/svg+xml");
    expect(svg.status).toBe(400);
    const fake = await upload(new TextEncoder().encode("not an image"), "logo.png", "image/png");
    expect(fake.status).toBe(400);

    const ok = await upload(PNG, "logo.png", "image/png");
    expect(ok.status).toBe(200);
    expect(ok.body.data.logoUrl).toContain(`/api/v1/public/logos/${org}`);

    const served = await call("GET", ok.body.data.logoUrl);
    expect(served.status).toBe(200);

    const big = await upload(new Uint8Array(2 * 1024 * 1024 + 10).fill(1), "big.png", "image/png");
    expect(big.status).toBe(413);
  });
});
