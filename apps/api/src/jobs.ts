import { emailJobSchema, QUEUES, type EmailJob } from "@freelo/contracts/jobs";
import { PgBoss } from "pg-boss";

import { env } from "./env";

// Producer side of the job queue (02-architecture.md §9). The worker consumes.
let started: Promise<PgBoss> | undefined;

function boss(): Promise<PgBoss> {
  started ??= (async () => {
    const instance = new PgBoss(env.DATABASE_URL);
    instance.on("error", (err) => console.error("[jobs]", err));
    await instance.start();
    // Idempotent; same retry policy as the worker so whichever starts first creates it.
    await instance.createQueue(QUEUES.email, { retryLimit: 5, retryDelay: 30, retryBackoff: true });
    return instance;
  })();
  return started;
}

// Methods live on an object so tests can spy on them.
export const jobs = {
  async enqueueEmail(email: EmailJob): Promise<void> {
    await (await boss()).send(QUEUES.email, emailJobSchema.parse(email));
  },

  async stop(): Promise<void> {
    if (started) await (await started).stop({ graceful: true });
    started = undefined;
  },
};
