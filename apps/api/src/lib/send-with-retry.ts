// apps/api/src/lib/send-with-retry.ts
import { sendEmail } from "@/services/email";

export async function sendEmailWithRetry(
  options: Parameters<typeof sendEmail>[0],
  { retries = 3, delayMs = 3000 } = {},
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await sendEmail(options);
    } catch (err) {
      const isRateLimit =
        err instanceof Error && err.message.includes("Too many emails per second");

      if (!isRateLimit || attempt === retries) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}