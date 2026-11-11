import { emailJobSchema, QUEUES } from "@freelo/contracts/jobs";
import { PgBoss } from "pg-boss";

import { createEmailSender } from "./email";
import { loadEnv } from "./env";

const env = loadEnv();
const sendEmail = createEmailSender(env);

const boss = new PgBoss(env.DATABASE_URL);
boss.on("error", (err) => console.error("[worker] pg-boss error", err));

await boss.start();

// Retry policy from 02-architecture.md §9: email 5 attempts, exponential backoff.
await boss.createQueue(QUEUES.email, { retryLimit: 5, retryDelay: 30, retryBackoff: true });

await boss.work(QUEUES.email, async (jobs) => {
  for (const job of jobs) {
    // Payloads are validated again here: the queue is a trust boundary.
    await sendEmail(emailJobSchema.parse(job.data));
  }
});

console.log("Worker started, queues:", Object.values(QUEUES).join(", "));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void boss.stop({ graceful: true }).finally(() => process.exit(0));
  });
}
