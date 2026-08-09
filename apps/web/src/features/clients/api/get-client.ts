// features/clients/api/get-client.ts
import { api } from "@/lib/api";
import type { Client } from "../types";

export async function getClient(clientId: string) {
  return api.get<Client>(`/api/clients/${clientId}`);
}