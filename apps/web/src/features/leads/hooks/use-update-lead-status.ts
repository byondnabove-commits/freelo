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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      // Was missing — without this, changing status from LeadDetailPage's
      // own status badge left the page showing stale data (status,
      // convertedClient) until something else forced a refetch.
      queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "Failed to update lead status.";
      toast.error(message);
    },
  });
}