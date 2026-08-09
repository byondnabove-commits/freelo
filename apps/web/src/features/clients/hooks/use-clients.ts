// features/clients/hooks/use-clients.ts
import { useQuery } from "@tanstack/react-query";
import { getClients } from "../api/get-clients";

export function useClients() {
  return useQuery({ queryKey: ["clients"], queryFn: getClients });
}