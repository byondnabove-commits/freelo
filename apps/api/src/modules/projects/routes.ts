import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { OrgEnv } from "@/types/hono";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";

import { projectService } from "./service";
import { CreateProjectSchema, UpdateProjectStageSchema, UpdateProjectSchema } from "./schema";

export const projectRoutes = new Hono<OrgEnv>();

projectRoutes.use("*", requireAuth);
projectRoutes.use("*", requireOrg);

projectRoutes.get("/", async (c) => {
  const projects = await projectService.list(c.get("organizationId"));
  return c.json({ data: projects });
});

projectRoutes.post("/", zValidator("json", CreateProjectSchema), async (c) => {
  const project = await projectService.create(c.get("organizationId"), c.req.valid("json"));
  return c.json({ data: project }, 201);
});

projectRoutes.get("/:projectId", async (c) => {
  const project = await projectService.getById(c.get("organizationId"), c.req.param("projectId"));
  return c.json({ data: project });
});

projectRoutes.patch(
  "/:projectId/stage",
  zValidator("json", UpdateProjectStageSchema),
  async (c) => {
    const project = await projectService.updateStage(
      c.get("organizationId"),
      c.req.param("projectId"),
      c.req.valid("json").stage,
    );
    return c.json({ data: project });
  },
);

projectRoutes.patch("/:projectId", zValidator("json", UpdateProjectSchema), async (c) => {
  const project = await projectService.update(
    c.get("organizationId"),
    c.req.param("projectId"),
    c.req.valid("json"),
  );
  return c.json({ data: project });
});

projectRoutes.delete("/:projectId", async (c) => {
  await projectService.delete(c.get("organizationId"), c.req.param("projectId"));
  return c.json({ success: true });
});