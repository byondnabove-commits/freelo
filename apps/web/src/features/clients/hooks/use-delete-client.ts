// features/clients/hooks/use-delete-client.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteClient } from "../api/delete-client";
import { ApiError } from "@/lib/api";

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted.");
      navigate("/dashboard/clients");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Failed to delete client.";
      toast.error(message);
    },
  });
}