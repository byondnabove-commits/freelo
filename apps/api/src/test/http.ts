import type { EmailJob } from "@freelo/contracts/jobs";
import { expect } from "vitest";

import { app } from "../app";

// HTTP helpers for integration tests: requests through the real app (Better Auth included).

export type Res = { status: number; body: any; cookie: string };

let ipCounter = 0;
const nextIp = () => `10.1.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
const cookiesOf = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

export async function call(
  method: string,
  path: string,
  opts: { cookie?: string; body?: unknown; form?: FormData; ip?: string } = {},
): Promise<Res> {
  const res = await app.request(path, {
    method,
    headers: {
      ...(opts.form ? {} : { "content-type": "application/json" }),
      origin: process.env.WEB_URL!,
      "x-forwarded-for": opts.ip ?? nextIp(),
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
    },
    body: opts.form ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body)),
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, cookie: cookiesOf(res) };
}

/** Signs up, follows the verification link from the captured email, returns the session cookie. */
export async function verifiedUser(sent: EmailJob[], email: string, name = "Test User") {
  const signUp = await call("POST", "/api/auth/sign-up/email", {
    body: { email, password: "correct-horse-battery-9", name },
  });
  expect(signUp.status).toBe(200);
  const job = sent.find((j) => j.to === email);
  expect(job).toBeDefined();
  const url = new URL(job!.text!.split(/\s+/).find((w) => w.startsWith("http"))!);
  const res = await app.request(url.pathname + url.search, { headers: { "x-forwarded-for": nextIp() } });
  const cookie = cookiesOf(res);
  expect(cookie).toContain("session_token");
  return { email, cookie };
}
