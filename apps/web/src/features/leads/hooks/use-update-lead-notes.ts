import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateLeadNotes } from "../api/update-lead-notes";
import { ApiError } from "@/lib/api";

export function useUpdateLeadNotes(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notes: string | null) => updateLeadNotes(leadId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to save notes.";
      toast.error(message);
    },
  });
}