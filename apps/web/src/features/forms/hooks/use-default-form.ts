import { useQuery } from "@tanstack/react-query";

import { getDefaultForm } from "../api/get-default-form";

export function useDefaultForm() {
  return useQuery({
    queryKey: ["default-form"],
    queryFn: getDefaultForm,
  });
}