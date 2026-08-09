import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { convertLead } from "../api/convert-lead";
import { ApiError } from "@/lib/api";

export function useConvertLead(leadId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => convertLead(leadId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success("Lead converted to client!");
      navigate(`/dashboard/clients/${res.data.id}`);
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to convert lead.";
      toast.error(message);
    },
  });
}