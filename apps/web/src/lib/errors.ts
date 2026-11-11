import type { TFunction } from "i18next";

import { ApiError } from "./api";

/** Translated message for an API error or a Better Auth client error. */
export function errorMessage(t: TFunction, err: unknown): string {
  if (err instanceof ApiError) return t(`errors.${err.code}`);
  const e = err as { status?: number; code?: string } | null;
  if (e?.status === 429) return t("errors.RATE_LIMITED");
  return t("errors.INTERNAL_ERROR");
}
