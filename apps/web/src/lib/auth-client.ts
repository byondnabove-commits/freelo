import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [inferAdditionalFields({ user: { locale: { type: "string", required: false } } })],
});

/** Absolute URL on this origin, for Better Auth callback/redirect URLs. */
export const here = (path: string) => `${window.location.origin}${path}`;
