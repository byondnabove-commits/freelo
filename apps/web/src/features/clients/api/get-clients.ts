// features/clients/api/get-clients.ts
import { api } from "@/lib/api";
import type { Client } from "../types";

export async function getClients() {
  return api.get<Client[]>("/api/clients");
}