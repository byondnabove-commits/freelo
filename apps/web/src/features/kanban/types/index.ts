import type { ProjectStage } from "@freelo/shared/db/schema/values.js";

export type Project = {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  description: string | null;
  stage: ProjectStage;
  deadline: string | null;
  createdAt: string;
};

export type { ProjectStage };