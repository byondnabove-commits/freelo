import { describe, expect, it } from "vitest";

import en from "./en.json";
import fr from "./fr.json";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("translations", () => {
  it("fr and en define exactly the same keys", () => {
    expect(keys(en).sort()).toEqual(keys(fr).sort());
  });
});
