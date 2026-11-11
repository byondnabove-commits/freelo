import { describe, expect, it, vi } from "vitest";

import { createEmailSender } from "./email";
import type { WorkerEnv } from "./env";

const env: WorkerEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgres://x@localhost/x",
  EMAIL_PROVIDER: "resend",
  EMAIL_FROM: "FreeLo <noreply@freelo.test>",
  SMTP_HOST: "localhost",
  SMTP_PORT: 1025,
  RESEND_API_KEY: "re_test",
};
const job = { to: "client@example.dz", subject: "Devis", html: "<p>Bonjour</p>", replyTo: "studio@example.dz" };

describe("resend sender", () => {
  it("posts the email with auth and reply_to", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    await createEmailSender(env, fetchMock as unknown as typeof fetch)(job);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toMatchObject({ to: [job.to], reply_to: job.replyTo });
  });

  it("throws on a provider error so the job is retried", async () => {
    const fetchMock = vi.fn(async () => new Response("bad", { status: 500 }));
    await expect(createEmailSender(env, fetchMock as unknown as typeof fetch)(job)).rejects.toThrow("500");
  });
});
