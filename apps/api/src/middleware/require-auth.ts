// middleware/require-auth.ts
import { createMiddleware } from "hono/factory";
import type { AppEnv, AuthEnv } from "@/types/hono";

export const requireAuth = createMiddleware<AppEnv & AuthEnv>(
  async (c, next) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        401,
      );
    }

    await next();
  },
);
