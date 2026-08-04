// modules/forms/api/get-public-form.ts
import { api } from "@/lib/api";
import type { PublicForm } from "../types";

export async function getPublicForm(slug: string) {
  return api.get<PublicForm>(`/api/forms/public/${slug}`);
}