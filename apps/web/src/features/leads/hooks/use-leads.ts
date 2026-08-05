// features/leads/hooks/use-leads.ts
import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/get-leads";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  });
}