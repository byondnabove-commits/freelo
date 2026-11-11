import { serve } from "@hono/node-server";

import { app } from "./app";
import { closeDb } from "./db";
import { env } from "./env";

const server = serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    void closeDb().finally(() => process.exit(0));
  });
}
