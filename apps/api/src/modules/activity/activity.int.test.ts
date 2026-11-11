import { runMigrations, schema, sql } from "@freelo/db";
import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../app";
import { closeDb, db } from "../../db";
import { hasTestDb } from "../../test/setup";

import { activityService } from "./service";

// Integration tests: need TEST_DATABASE_URL (docker compose dev stack, or CI's Postgres service).
describe.skipIf(!hasTestDb)("activity (integration)", () => {
  const orgA = `org_${uuidv7()}`;
  const orgB = `org_${uuidv7()}`;
  const entity = { type: "lead", id: uuidv7() };
  const actor = { type: "system" as const, id: null };

  beforeAll(async () => {
    await runMigrations(db);
    await db.insert(schema.organization).values([
      { id: orgA, name: "A", slug: orgA },
      { id: orgB, name: "B", slug: orgB },
    ]);
  });

  afterAll(async () => {
    await db.execute(sql`delete from organization where id in (${orgA}, ${orgB})`);
    await closeDb();
  });

  it("reports a healthy database", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  it("records inside a transaction and lists newest first, scoped to the workspace", async () => {
    await db.transaction(async (tx) => {
      await activityService.record(tx, orgA, { actor, entity, type: "workspace.created", data: { n: 1 } });
      await activityService.record(tx, orgA, { actor, entity, type: "workspace.created", data: { n: 2 } });
    });

    const rows = await activityService.listForEntity(db, orgA, entity, { limit: 10 });
    expect(rows.map((r) => r.data)).toEqual([{ n: 2 }, { n: 1 }]);
    expect(await activityService.listForEntity(db, orgB, entity, { limit: 10 })).toEqual([]);
  });

  it("writes nothing when the surrounding transaction rolls back", async () => {
    const other = { type: "lead", id: uuidv7() };
    await expect(
      db.transaction(async (tx) => {
        await activityService.record(tx, orgA, { actor, entity: other, type: "workspace.created" });
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");
    expect(await activityService.listForEntity(db, orgA, other, { limit: 10 })).toEqual([]);
  });

  it("pages with a cursor", async () => {
    const [first] = await activityService.listForEntity(db, orgA, entity, { limit: 1 });
    const next = await activityService.listForEntity(db, orgA, entity, {
      limit: 10,
      before: { createdAt: first!.createdAt, id: first!.id },
    });
    expect(next.map((r) => r.data)).toEqual([{ n: 1 }]);
  });
});
