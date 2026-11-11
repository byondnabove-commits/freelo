import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "@/lib/api";

// S0 placeholder: proves web → typed API client → API → database end to end.
export function HomePage() {
  const { t, i18n } = useTranslation();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await api.health.$get();
      return res.ok;
    },
  });

  const status = health.isPending ? "checking" : health.data ? "ok" : "down";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-4xl font-semibold">FreeLo</h1>
      <p className="text-neutral-600">{t("app.tagline")}</p>
      <p className={status === "ok" ? "text-green-700" : status === "down" ? "text-red-700" : "text-neutral-500"}>
        {t(`app.status.${status}`)}
      </p>
      <button
        type="button"
        className="self-start text-sm underline"
        onClick={() => void i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
      >
        {t("app.language")}
      </button>
    </main>
  );
}
