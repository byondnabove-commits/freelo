import type { ActivityType, ActorType } from "@freelo/contracts/activity";
import type { DbOrTx } from "@freelo/db";

import { activityRepository } from "./repository";

export type RecordActivityInput = {
  actor: { type: ActorType; id: string | null };
  entity: { type: string; id: string };
  type: ActivityType;
  data?: Record<string, unknown>;
};

// Other services call `record` with their open transaction, so the event is
// written only if the change itself commits.
export const activityService = {
  record(tx: DbOrTx, organizationId: string, input: RecordActivityInput) {
    return activityRepository.insert(tx, organizationId, {
      actorType: input.actor.type,
      actorId: input.actor.id,
      entityType: input.entity.type,
      entityId: input.entity.id,
      type: input.type,
      data: input.data ?? {},
    });
  },

  listForEntity: activityRepository.listByEntity,
};
