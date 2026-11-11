import type { AppType } from "@freelo/api/app";
import type { ErrorCode } from "@freelo/contracts/errors";
import { hc } from "hono/client";

// The API is served from the same origin (Vite proxy in dev, Caddy in production).
export const api = hc<AppType>(window.location.origin, { init: { credentials: "include" } });

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

/** Unwraps `{ data }` or throws ApiError with the API's error code. */
export async function unwrap<T>(res: Response | Promise<Response>): Promise<T> {
  const r = await res;
  const body = (await r.json().catch(() => null)) as { data?: T; error?: { code: ErrorCode; message: string } } | null;
  if (!r.ok) throw new ApiError(r.status, body?.error?.code ?? "INTERNAL_ERROR", body?.error?.message ?? r.statusText);
  return body!.data as T;
}
