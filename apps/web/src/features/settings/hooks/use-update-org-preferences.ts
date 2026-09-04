import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrgPreferences } from "../api/update-preferences";

export function useUpdateOrgPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrgPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-preferences"] });
    },
  });
}