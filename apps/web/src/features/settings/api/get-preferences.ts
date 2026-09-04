import { api } from "@/lib/api";
import type { OrgPreferences } from "../types";

export async function getOrgPreferences() {
  return api.get<OrgPreferences>("/api/settings/preferences");
}