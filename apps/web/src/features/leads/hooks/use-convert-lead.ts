import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { convertLead } from "../api/convert-lead";
import type { ConvertLeadProjectInput } from "../api/convert-lead";
import { ApiError } from "@/lib/api";

interface UseConvertLeadOptions {
  // Whether a successful conversion navigates away to the new client/project.
  // Defaults to true, matching the original manual "Convert to client"
  // button's behavior on LeadDetailPage — you're already focused on this
  // one lead, so jumping to the result makes sense there. LeadStatusBadge
  // passes false when rendered inside the leads table, where navigating a
  // user away mid-list-browsing would be a jarring surprise.
  navigateOnConvert?: boolean;
}

export function useConvertLead(leadId: string, options?: UseConvertLeadOptions) {
  const navigateOnConvert = options?.navigateOnConvert ?? true;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (project?: ConvertLeadProjectInput | null) =>
      convertLead(leadId, project),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      toast.success(
        res.data.project
          ? "Lead converted — client and project created!"
          : "Lead converted to client!",
      );

      if (!navigateOnConvert) return;

      if (res.data.project) {
        navigate(`/dashboard/kanban/${res.data.project.id}`);
      } else {
        navigate(`/dashboard/clients/${res.data.client.id}`);
      }
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to convert lead.";
      toast.error(message);
    },
  });
}