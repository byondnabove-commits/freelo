// api/update-project-stage.ts
import { api } from "@/lib/api";
import type { Project, ProjectStage } from "../types";

export async function updateProjectStage(projectId: string, stage: ProjectStage) {
  return api.patch<Project>(`/api/projects/${projectId}/stage`, { stage });
}