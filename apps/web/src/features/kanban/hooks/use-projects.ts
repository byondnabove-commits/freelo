// hooks/use-projects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/get-projects";

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: getProjects });
}