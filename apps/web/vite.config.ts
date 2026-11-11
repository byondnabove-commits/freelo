import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The root .env is shared by every app; Vite only exposes VITE_* variables.
  envDir: "../..",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // Same origin in dev as in production (Caddy): cookies stay first-party and
  // email links point at the web host.
  server: {
    proxy: {
      // xfwd: send X-Forwarded-For like Caddy does, so per-IP rate limits work in dev.
      "/api": { target: "http://localhost:3001", xfwd: true },
      "/health": "http://localhost:3001",
    },
  },
});
