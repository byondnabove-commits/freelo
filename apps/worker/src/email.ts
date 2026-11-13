import type { EmailJob } from "@freelo/contracts/jobs";
import nodemailer from "nodemailer";

import type { WorkerEnv } from "./env";

export type SendEmail = (job: EmailJob) => Promise<void>;

// Provider chosen by environment: console or Mailpit (SMTP) in development, Resend in production.
export function createEmailSender(env: WorkerEnv, fetchImpl: typeof fetch = fetch): SendEmail {
  if (env.EMAIL_PROVIDER === "resend") {
    return async (job) => {
      const res = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [job.to],
          subject: job.subject,
          html: job.html,
          ...(job.text ? { text: job.text } : {}),
          ...(job.replyTo ? { reply_to: job.replyTo } : {}),
        }),
      });
      // Throwing lets pg-boss retry the job.
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
    };
  }

  if (env.EMAIL_PROVIDER === "console") {
    // Dev without Mailpit: print the email so links (verify, reset) open from the worker log.
    return async (job) => {
      console.log(`\n--- email to ${job.to}: ${job.subject}\n${job.text ?? job.html}\n---\n`);
    };
  }

  const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false });
  return async (job) => {
    await transport.sendMail({ from: env.EMAIL_FROM, to: job.to, subject: job.subject, html: job.html, text: job.text, replyTo: job.replyTo });
  };
}
