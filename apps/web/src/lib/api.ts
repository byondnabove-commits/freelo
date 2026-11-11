import type { AppType } from "@freelo/api/app";
import { hc } from "hono/client";

// Typed client generated from the API's routes (02-architecture.md §3.2).
// Cookies are sent for Better Auth sessions (S1).
export const api = hc<AppType>(import.meta.env.VITE_API_URL, {
  init: { credentials: "include" },
});
