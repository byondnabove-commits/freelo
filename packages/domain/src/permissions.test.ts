import { describe, expect, it } from "vitest";

import { can } from "./permissions";

describe("can", () => {
  it.each([
    ["owner", "members.invite", true],
    ["owner", "members.remove", true],
    ["owner", "workspace.update", true],
    ["owner", "workspace.use", true],
    ["owner", "workspace.leave", true],
    ["member", "members.invite", false],
    ["member", "members.remove", false],
    ["member", "workspace.update", false],
    ["member", "workspace.use", true],
    ["member", "workspace.leave", true],
  ] as const)("%s %s → %s", (role, action, expected) => {
    expect(can(role, action)).toBe(expected);
  });
});
