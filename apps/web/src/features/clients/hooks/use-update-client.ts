// features/clients/hooks/use-update-client.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateClient } from "../api/update-client";
import { ApiError } from "@/lib/api";
import type { Client } from "../types";

export function useUpdateClient(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<Client, "name" | "email" | "company" | "phone" | "notes">>) =>
      updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to update client.";
      toast.error(message);
    },
  });
}