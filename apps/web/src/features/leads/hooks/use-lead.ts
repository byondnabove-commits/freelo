import { useQuery } from "@tanstack/react-query";
import { getLead } from "../api/get-lead";

export function useLead(leadId: string) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId),
  });
}