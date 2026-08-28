// hooks/use-update-project-stage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProjectStage } from "../api/update-project-stage";
import { ApiError } from "@/lib/api";
import type { Project, ProjectStage } from "../types";

export function useUpdateProjectStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, stage }: { projectId: string; stage: ProjectStage }) =>
      updateProjectStage(projectId, stage),
    // Optimistic: the board already moved the card visually on drop;
    // this just persists it. On failure, roll back to the server truth.
    onMutate: async ({ projectId, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData<{ data: Project[] }>(["projects"]);

      queryClient.setQueryData<{ data: Project[] }>(["projects"], (old) => {
        if (!old) return old;
        return {
          data: old.data.map((p) => (p.id === projectId ? { ...p, stage } : p)),
        };
      });

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous);
      }
      const message = err instanceof ApiError ? err.message : "Failed to move project.";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}