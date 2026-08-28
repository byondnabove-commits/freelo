// api/create-project.ts
import { api } from "@/lib/api";
import type { Project } from "../types";

export async function createProject(data: { clientId: string; name: string }) {
  return api.post<Project>("/api/projects", data);
}