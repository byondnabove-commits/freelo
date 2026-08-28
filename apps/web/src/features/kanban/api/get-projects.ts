// api/get-projects.ts
import { api } from "@/lib/api";
import type { Project } from "../types";

export async function getProjects() {
  return api.get<Project[]>("/api/projects");
}