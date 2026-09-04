import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markLeadLost } from "../api/mark-lead-lost";
import { ApiError } from "@/lib/api";
import type { LeadLostReason } from "../types";

export function useMarkLeadLost(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: LeadLostReason) => markLeadLost(leadId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success("Lead marked as lost.");
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "Failed to update lead.";
      toast.error(message);
    },
  });
}