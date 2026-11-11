import type { Role } from "@freelo/contracts/auth";

// Who may do what in a workspace (03-s1 §5). The API enforces it and the web app
// uses the same table to hide buttons.
const OWNER_ONLY = ["members.invite", "members.remove", "workspace.update"] as const;
const EVERYONE = ["workspace.use", "workspace.leave"] as const;

export type Action = (typeof OWNER_ONLY)[number] | (typeof EVERYONE)[number];

export function can(role: Role, action: Action): boolean {
  if ((EVERYONE as readonly string[]).includes(action)) return true;
  return role === "owner";
}
