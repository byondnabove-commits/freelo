// features/forms/hooks/use-publish-form.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishForm } from "../api/publish-form";

export function usePublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishForm,
    onSuccess: () => {
      // Refetch the default form so `state` flips to "published" in the UI
      queryClient.invalidateQueries({ queryKey: ["default-form"] });
    },
  });
}