import type { ErrorCode, ErrorResponse } from "@freelo/contracts/errors";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Every expected failure is an AppError. Anything else becomes INTERNAL_ERROR. */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: ContentfulStatusCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string) => new AppError("NOT_FOUND", 404, `${what} not found`);

function body(code: ErrorCode, message: string, details?: Record<string, unknown>): ErrorResponse {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

export function handleError(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json(body(err.code, err.message, err.details), err.status);
  }
  console.error(`[${c.get("requestId")}]`, err);
  return c.json(body("INTERNAL_ERROR", "Something went wrong"), 500);
}

export function handleNotFound(c: Context) {
  return c.json(body("NOT_FOUND", "Route not found"), 404);
}
