import type { Me } from "@freelo/contracts/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { api, ApiError, unwrap } from "./api";

/** The signed-in user, memberships and active workspace; `null` when signed out. */
export function useMe() {
  const { i18n } = useTranslation();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await unwrap<Me>(api.api.v1.me.$get());
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
  });
  const locale = query.data?.user.locale;
  useEffect(() => {
    if (locale && i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale, i18n]);
  return query;
}

export function useRefreshMe() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}
