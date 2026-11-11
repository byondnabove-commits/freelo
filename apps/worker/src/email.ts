import type { EmailJob } from "@freelo/contracts/jobs";
import nodemailer from "nodemailer";

import type { WorkerEnv } from "./env";

export type SendEmail = (job: EmailJob) => Promise<void>;

// Provider chosen by environment: Mailpit over SMTP in development, Resend in production.
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

  const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false });
  return async (job) => {
    await transport.sendMail({ from: env.EMAIL_FROM, to: job.to, subject: job.subject, html: job.html, text: job.text, replyTo: job.replyTo });
  };
}
