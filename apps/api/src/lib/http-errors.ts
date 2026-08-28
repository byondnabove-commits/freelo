// lib/http-errors.ts
import type { Context } from "hono";

import {
  FormNotFoundError,
  FormAlreadyPublishedError,
  FormFieldNotFoundError,
  MaxFieldsReachedError,
  InvalidSubmissionError,
} from "@/modules/forms/errors";

import { ProjectNotFoundError } from "@/modules/projects/errors";

import {
  LeadNotFoundError,
  InvalidLeadDataError,
} from "@/modules/leads/errors";

import {
  ClientNotFoundError,
  LeadAlreadyConvertedError,
} from "@/modules/clients/errors";

const ERROR_STATUS_MAP = [
  [FormNotFoundError, 404],
  [FormFieldNotFoundError, 404],
  [LeadNotFoundError, 404],
  [FormAlreadyPublishedError, 409],
  [MaxFieldsReachedError, 422],
  [InvalidSubmissionError, 400],
  [InvalidLeadDataError, 400],
  [ClientNotFoundError, 404],
  [LeadAlreadyConvertedError, 409],
  [ProjectNotFoundError, 404],
] as const;

export function handleAppError(err: unknown, c: Context) {
  for (const [ErrorClass, status] of ERROR_STATUS_MAP) {
    if (err instanceof ErrorClass) {
      return c.json(
        { error: { code: ErrorClass.name, message: err.message } },
        status,
      );
    }
  }

  console.error(err);
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal Server Error" } },
    500,
  );
}
