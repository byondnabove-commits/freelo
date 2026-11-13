import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
    // Integration tests share one test database; run files one at a time.
    fileParallelism: false,
    // A remote test database (Neon) adds network latency to every query.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
