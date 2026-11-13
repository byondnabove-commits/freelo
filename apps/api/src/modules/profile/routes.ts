import { businessStepSchema, LOGO_MAX_BYTES, servicesStepSchema, workStepSchema } from "@freelo/contracts/onboarding";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import type { AppEnv } from "../../app-env";
import { AppError } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth, requireOrg, requirePermission } from "../../middleware/auth";
import { profileService } from "./service";

const owner = [requireAuth, requireOrg, requirePermission("workspace.update")] as const;

/** Onboarding (04-s2 §9). Step 1 needs only a session; later steps act on the active workspace. */
export const onboardingRoutes = new Hono<AppEnv>()
  .get("/", requireAuth, async (c) => c.json({ data: await profileService.state(c.get("user")!, c.get("session")!) }))
  .post("/business", requireAuth, validate("json", businessStepSchema), async (c) => {
    const result = await profileService.business(c.get("user")!, c.get("session")!, c.req.valid("json").name);
    return c.json({ data: result });
  })
  .put("/services", ...owner, validate("json", servicesStepSchema), async (c) => {
    await profileService.services(c.get("organizationId"), c.req.valid("json").services);
    return c.json({ data: { ok: true } });
  })
  .put("/work", ...owner, validate("json", workStepSchema), async (c) => {
    await profileService.work(c.get("organizationId"), c.get("user")!, c.req.valid("json"));
    return c.json({ data: { ok: true } });
  })
  .post("/complete", ...owner, async (c) => {
    await profileService.complete(c.get("organizationId"), c.get("user")!.id);
    return c.json({ data: { ok: true } });
  });

export const logoRoutes = new Hono<AppEnv>()
  .post(
    "/",
    ...owner,
    bodyLimit({
      maxSize: LOGO_MAX_BYTES + 64 * 1024, // multipart overhead
      onError: () => {
        throw new AppError("VALIDATION_FAILED", 413, "Logo must be 2 MB or less", { field: "logo" });
      },
    }),
    async (c) => {
      const body = await c.req.parseBody();
      const file = body.logo;
      if (!(file instanceof File)) throw new AppError("VALIDATION_FAILED", 400, "Missing logo file", { field: "logo" });
      if (file.size > LOGO_MAX_BYTES) throw new AppError("VALIDATION_FAILED", 413, "Logo must be 2 MB or less", { field: "logo" });
      const result = await profileService.setLogo(c.get("organizationId"), c.get("user")!.id, new Uint8Array(await file.arrayBuffer()));
      return c.json({ data: result });
    },
  )
  .delete("/", ...owner, async (c) => {
    await profileService.removeLogo(c.get("organizationId"));
    return c.json({ data: { ok: true } });
  });

export const publicLogoRoutes = new Hono<AppEnv>().get("/:organizationId", async (c) => {
  const logo = await profileService.getLogo(c.req.param("organizationId"));
  return c.body(new Uint8Array(logo.bytes), 200, {
    "Content-Type": logo.mimeType,
    "Cache-Control": "public, max-age=300",
  });
});
