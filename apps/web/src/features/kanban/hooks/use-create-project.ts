// hooks/use-create-project.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProject } from "../api/create-project";
import { ApiError } from "@/lib/api";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created!");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to create project.";
      toast.error(message);
    },
  });
}