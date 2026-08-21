// features/clients/api/delete-client.ts
import { api } from "@/lib/api";

export async function deleteClient(clientId: string) {
  return api.delete<{ success: boolean }>(`/api/clients/${clientId}`);
}