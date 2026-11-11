import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

import { AppError } from "./errors";

/** zod validation for body/query/params that fails with the standard VALIDATION_FAILED error. */
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new AppError("VALIDATION_FAILED", 400, "Invalid request", {
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
  });
