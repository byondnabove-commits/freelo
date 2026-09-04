import { useQuery } from "@tanstack/react-query";
import { getOrgPreferences } from "../api/get-preferences";

export function useOrgPreferences() {
  return useQuery({
    queryKey: ["org-preferences"],
    queryFn: getOrgPreferences,
    staleTime: 1000 * 60 * 5,
  });
}