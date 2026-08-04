// modules/forms/hooks/use-public-form.ts
import { useQuery } from "@tanstack/react-query";
import { getPublicForm } from "../api/get-public-form";

export function usePublicForm(slug: string) {
  return useQuery({
    queryKey: ["public-form", slug],
    queryFn: () => getPublicForm(slug),
    retry: false, // 404 on bad slug shouldn't retry 3x
  });
}