import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { app } from "./app";
import { AppError, handleError } from "./lib/errors";
import { validate } from "./lib/validate";

describe("app shell", () => {
  it("answers unknown routes with the standard error format", async () => {
    const res = await app.request("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  it("sets security headers and a request id on every response", async () => {
    const res = await app.request("/api/v1/nope");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });
});

describe("errors and validation", () => {
  const test = new Hono()
    .post("/echo", validate("json", z.object({ name: z.string().min(1) })), (c) =>
      c.json({ data: c.req.valid("json") }),
    )
    .get("/boom", () => {
      throw new Error("secret detail");
    })
    .get("/conflict", () => {
      throw new AppError("CONFLICT", 409, "Already exists");
    });
  test.onError(handleError);

  it("rejects invalid input with VALIDATION_FAILED and the failing path", async () => {
    const res = await test.request("/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string; details: { issues: { path: string }[] } } };
    expect(json.error.code).toBe("VALIDATION_FAILED");
    expect(json.error.details.issues[0]?.path).toBe("name");
  });

  it("maps AppError to its status and code", async () => {
    const res = await test.request("/conflict");
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: "CONFLICT", message: "Already exists" } });
  });

  it("hides unexpected errors behind INTERNAL_ERROR", async () => {
    const res = await test.request("/boom");
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain("INTERNAL_ERROR");
    expect(text).not.toContain("secret detail");
  });
});
