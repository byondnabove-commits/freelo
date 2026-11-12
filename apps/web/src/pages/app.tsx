import type { Role } from "@freelo/contracts/auth";
import { can } from "@freelo/domain/permissions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useNavigate } from "react-router";

import { Alert, Button, Field, Spinner } from "@/components/ui";
import { api, unwrap } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { clearAllDrafts } from "@/lib/draft";
import { errorMessage } from "@/lib/errors";
import { useMe, useRefreshMe } from "@/lib/me";

function useActive() {
  const me = useMe().data!;
  const active = me.memberships.find((m) => m.organizationId === me.activeOrganizationId)!;
  return { me, active };
}

export function AppShell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const { me, active } = useActive();

  async function switchTo(organizationId: string) {
    await unwrap(api.api.v1.workspaces.active.$post({ json: { organizationId } }));
    await refresh();
    navigate("/app");
  }

  async function toggleLanguage() {
    const locale = i18n.language === "fr" ? "en" : "fr";
    await i18n.changeLanguage(locale);
    await authClient.updateUser({ locale });
    await refresh();
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-green-50 font-medium text-green-800" : "text-neutral-700 hover:bg-neutral-100"}`;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-60 flex-col gap-6 border-r border-neutral-200 bg-white p-4">
        <p className="text-lg font-bold">FreeLo</p>
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          {t("workspace.switcher")}
          <select
            className="h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm text-neutral-900"
            value={active.organizationId}
            onChange={(e) => void switchTo(e.target.value)}
          >
            {me.memberships.map((m) => (
              <option key={m.organizationId} value={m.organizationId}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <nav className="flex flex-col gap-1">
          <NavLink to="/app" end className={navClass}>
            {t("shell.nav.today")}
          </NavLink>
          <NavLink to="/app/settings/members" className={navClass}>
            {t("shell.nav.members")}
          </NavLink>
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4">
          <p className="truncate text-sm font-medium">{me.user.name}</p>
          <p className="truncate text-xs text-neutral-500">{me.user.email}</p>
          <Button variant="ghost" className="justify-start" onClick={() => void toggleLanguage()}>
            {t("app.language")}
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={async () => {
              clearAllDrafts(me.user.id);
              await authClient.signOut();
              await refresh();
              navigate("/login");
            }}
          >
            {t("common.signOut")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function TodayPage() {
  const { t } = useTranslation();
  const { active } = useActive();
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-semibold">{active.name}</h1>
      <p className="mt-2 text-neutral-600">{t("shell.empty")}</p>
    </section>
  );
}

type MembersData = {
  members: { memberId: string; userId: string; name: string; email: string; role: Role }[];
  invitations: { id: string; email: string; role: Role | null; expiresAt: string }[];
};

export function MembersPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const { me, active } = useActive();
  const isOwner = can(active.role, "members.invite");
  const members = useQuery({
    queryKey: ["members", active.organizationId],
    queryFn: () => unwrap<MembersData>(api.api.v1.workspace.members.$get()),
  });
  const [notice, setNotice] = useState<string | null>(null);

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    act.mutate(() => unwrap(api.api.v1.workspace.invitations.$post({ json: { email, role: "member" } })), {
      onSuccess: () => {
        form.reset();
        setNotice("members.invite.sent");
      },
    });
  }

  if (!members.data) return <Spinner />;
  const date = (iso: string) => new Intl.DateTimeFormat(i18n.language).format(new Date(iso));

  return (
    <section className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold">{t("members.title")}</h1>
      {act.error ? <Alert>{errorMessage(t, act.error)}</Alert> : null}
      {notice ? <Alert tone="success">{t(notice)}</Alert> : null}

      <ul className="divide-y divide-neutral-200 rounded-xl bg-white ring-1 ring-neutral-200">
        {members.data.members.map((m) => (
          <li key={m.memberId} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {m.name} {m.userId === me.user.id ? <span className="text-neutral-400">({t("members.you")})</span> : null}
              </p>
              <p className="truncate text-xs text-neutral-500">{m.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{t(`workspace.role.${m.role}`)}</span>
              {isOwner && m.userId !== me.user.id ? (
                <Button
                  variant="danger"
                  className="h-8"
                  onClick={() =>
                    window.confirm(`${t("members.remove")} ${m.name}?`) &&
                    act.mutate(() => unwrap(api.api.v1.workspace.members[":memberId"].$delete({ param: { memberId: m.memberId } })))
                  }
                >
                  {t("members.remove")}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {isOwner ? (
        <>
          {members.data.invitations.length ? (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-neutral-700">{t("members.pending")}</h2>
              <ul className="divide-y divide-neutral-200 rounded-xl bg-white ring-1 ring-neutral-200">
                {members.data.invitations.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm">{inv.email}</p>
                      <p className="text-xs text-neutral-500">{t("members.expires", { date: date(inv.expiresAt) })}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="h-8"
                        onClick={() => act.mutate(() => unwrap(api.api.v1.workspace.invitations[":id"].resend.$post({ param: { id: inv.id } })))}
                      >
                        {t("members.resend")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8"
                        onClick={() => act.mutate(() => unwrap(api.api.v1.workspace.invitations[":id"].$delete({ param: { id: inv.id } })))}
                      >
                        {t("members.cancelInvite")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <form onSubmit={invite} className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-700">{t("members.invite.title")}</h2>
            <Field label={t("common.email")} name="email" type="email" required />
            <Button type="submit" className="self-start" disabled={act.isPending}>
              {t("members.invite.submit")}
            </Button>
          </form>
        </>
      ) : null}

      <Button
        variant="ghost"
        className="self-start text-red-700"
        onClick={() =>
          window.confirm(`${t("members.leave")}?`) &&
          act.mutate(() => unwrap(api.api.v1.workspace.leave.$post()), {
            onSuccess: async () => {
              await refresh();
              navigate("/app");
            },
          })
        }
      >
        {t("members.leave")}
      </Button>
    </section>
  );
}
