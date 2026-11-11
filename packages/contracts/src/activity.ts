export const ACTOR_TYPES = ["member", "client", "system"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

// Every activity event type, `<entity>.<verb>`. Feature slices add theirs here.
export const ACTIVITY_TYPES = ["workspace.created"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
