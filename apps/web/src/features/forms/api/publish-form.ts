// features/forms/api/publish-form.ts
import { api } from "@/lib/api";
import type { FormWithFields } from "../types";

export async function publishForm() {
  return api.post<FormWithFields>("/api/forms/publish");
}