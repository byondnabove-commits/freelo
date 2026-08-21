// features/leads/hooks/use-delete-lead.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteLead } from "../api/delete-lead";
import { ApiError } from "@/lib/api";

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (leadId: string) => deleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted.");
      navigate("/dashboard/leads");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to delete lead.";
      toast.error(message);
    },
  });
}