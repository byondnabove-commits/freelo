import { index, jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { ACTOR_TYPES } from "@freelo/contracts/activity";
import { createdAt, id, organizationId } from "./columns";

export const actorTypeEnum = pgEnum("actor_type", ACTOR_TYPES);

// Append-only timeline/audit log (02-architecture.md §7). Never updated or deleted by the app.
export const activityEvents = pgTable(
  "activity_events",
  {
    id: id(),
    organizationId: organizationId(),
    actorType: actorTypeEnum().notNull(),
    // member: user id · client: contact id · system: null
    actorId: text(),
    entityType: text().notNull(),
    entityId: uuid().notNull(),
    type: text().notNull(),
    data: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("activity_events_org_entity_idx").on(
      t.organizationId,
      t.entityType,
      t.entityId,
      t.createdAt,
    ),
    index("activity_events_org_created_idx").on(t.organizationId, t.createdAt),
  ],
);
