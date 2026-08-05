// features/leads/hooks/use-update-lead-status.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateLeadStatus } from "../api/update-lead-status";
import { ApiError } from "@/lib/api";
import type { LeadStatus } from "../types";

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "Failed to update lead status.";
      toast.error(message);
    },
  });
}