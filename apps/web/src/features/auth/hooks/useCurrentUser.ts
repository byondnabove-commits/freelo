import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/get-me";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,

    retry: false,

    staleTime: 1000 * 60 * 5,
  });
}
