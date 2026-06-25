import { api } from "../../../lib/api";


import type { MeResponse } from "../types/types";

export async function getMe(): Promise<MeResponse> {
  const response = await api.get<MeResponse>("/api/me");

  return response.data;
}