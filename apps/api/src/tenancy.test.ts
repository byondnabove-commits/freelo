import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Static guard for 02-architecture.md §4: in every repository, each `.where(...)`
// must filter on organizationId, each update/delete must have a where, and each
// insert must set organizationId. A line with `tenancy-exempt: <reason>` opts out.

const modulesDir = fileURLToPath(new URL("./modules", import.meta.url));

function repositoryFiles(): string[] {
  return readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(modulesDir, d.name, "repository.ts"))
    .filter((file) => {
      try {
        readFileSync(file);
        return true;
      } catch {
        return false;
      }
    });
}

/** Text of each balanced `name(...)` call in the source. */
function calls(source: string, name: string): string[] {
  const found: string[] = [];
  let from = 0;
  for (;;) {
    const start = source.indexOf(`${name}(`, from);
    if (start === -1) return found;
    let depth = 0;
    let end = start + name.length;
    for (; end < source.length; end++) {
      if (source[end] === "(") depth++;
      if (source[end] === ")" && --depth === 0) break;
    }
    found.push(source.slice(start, end + 1));
    from = end;
  }
}

export function tenancyViolations(source: string): string[] {
  const exempt = (snippet: string) => snippet.includes("tenancy-exempt:");
  const problems: string[] = [];
  for (const where of calls(source, ".where")) {
    if (!where.includes("organizationId") && !exempt(where)) problems.push(`where without organizationId: ${where}`);
  }
  for (const values of calls(source, ".values")) {
    if (!values.includes("organizationId") && !exempt(values)) problems.push(`insert without organizationId: ${values}`);
  }
  for (const op of ["update", "delete"]) {
    const statements = source.split(new RegExp(`(?=\\.${op}\\()`)).slice(1);
    for (const statement of statements) {
      const untilEnd = statement.split(";")[0]!;
      if (!untilEnd.includes(".where(") && !exempt(untilEnd)) problems.push(`${op} without where`);
    }
  }
  return problems;
}

describe("tenancy guard", () => {
  it("finds repositories to check", () => {
    expect(repositoryFiles().length).toBeGreaterThan(0);
  });

  it.each(repositoryFiles().map((f) => [f.slice(modulesDir.length + 1)] as const))(
    "%s scopes every query by organizationId",
    (relative) => {
      expect(tenancyViolations(readFileSync(join(modulesDir, relative), "utf8"))).toEqual([]);
    },
  );

  it("catches an unscoped query", () => {
    expect(tenancyViolations("db.select().from(t).where(eq(t.id, id));")).toHaveLength(1);
    expect(tenancyViolations("db.delete(t);")).toEqual(["delete without where"]);
    expect(tenancyViolations("db.insert(t).values({ name });")).toHaveLength(1);
    expect(tenancyViolations("db.update(t).set(x).where(eq(t.organizationId, o));")).toEqual([]);
  });
});
