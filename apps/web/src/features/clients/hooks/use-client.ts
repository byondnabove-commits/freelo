// features/clients/hooks/use-client.ts
import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api/get-client";

export function useClient(clientId: string) {
  return useQuery({ queryKey: ["client", clientId], queryFn: () => getClient(clientId) });
}