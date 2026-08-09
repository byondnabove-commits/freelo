// features/clients/api/update-client.ts
import { api } from "@/lib/api";
import type { Client } from "../types";

export async function updateClient(
  clientId: string,
  data: Partial<Pick<Client, "name" | "email" | "company" | "phone" | "notes">>,
) {
  return api.patch<Client>(`/api/clients/${clientId}`, data);
}