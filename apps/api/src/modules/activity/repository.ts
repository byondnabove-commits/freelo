import { and, desc, eq, lt, or, schema, type DbOrTx } from "@freelo/db";

const { activityEvents } = schema;

export type NewActivityEvent = Omit<typeof activityEvents.$inferInsert, "id" | "organizationId" | "createdAt">;

// Every method takes organizationId first and filters on it (02-architecture.md §4).
export const activityRepository = {
  async insert(db: DbOrTx, organizationId: string, event: NewActivityEvent) {
    const [row] = await db
      .insert(activityEvents)
      .values({ ...event, organizationId })
      .returning();
    return row!;
  },

  async listByEntity(
    db: DbOrTx,
    organizationId: string,
    entity: { type: string; id: string },
    page: { limit: number; before?: { createdAt: Date; id: string } },
  ) {
    const { before } = page;
    return db
      .select()
      .from(activityEvents)
      .where(
        and(
          eq(activityEvents.organizationId, organizationId),
          eq(activityEvents.entityType, entity.type),
          eq(activityEvents.entityId, entity.id),
          before
            ? or(
                lt(activityEvents.createdAt, before.createdAt),
                and(eq(activityEvents.createdAt, before.createdAt), lt(activityEvents.id, before.id)),
              )
            : undefined,
        ),
      )
      .orderBy(desc(activityEvents.createdAt), desc(activityEvents.id))
      .limit(page.limit);
  },
};
