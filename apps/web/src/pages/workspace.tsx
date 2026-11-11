import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";

import { Alert, AuthCard, Button, Field, Spinner } from "@/components/ui";
import { api, unwrap } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { errorMessage } from "@/lib/errors";
import { useMe, useRefreshMe } from "@/lib/me";

/** Onboarding step 1 (S1 minimal version; S2 adds the other steps). */
export function CreateWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const create = useMutation({
    mutationFn: (name: string) => unwrap(api.api.v1.workspaces.$post({ json: { name } })),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    create.mutate(String(new FormData(e.currentTarget).get("name") ?? "").trim());
  }

  return (
    <AuthCard title={t("workspace.new.title")} subtitle={t("workspace.new.subtitle")}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {create.error ? <Alert>{errorMessage(t, create.error)}</Alert> : null}
        <Field
          label={t("workspace.new.label")}
          name="name"
          placeholder={t("workspace.new.placeholder")}
          required
          minLength={2}
          maxLength={80}
          autoFocus
        />
        <Button type="submit" disabled={create.isPending}>
          {t("workspace.new.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}

export function SelectWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const me = useMe();
  const select = useMutation({
    mutationFn: (organizationId: string) => unwrap(api.api.v1.workspaces.active.$post({ json: { organizationId } })),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
  });

  if (!me.data) return <Spinner />;
  return (
    <AuthCard title={t("workspace.select.title")}>
      {me.data.memberships.map((m) => (
        <Button key={m.organizationId} variant="secondary" className="justify-between" onClick={() => select.mutate(m.organizationId)}>
          <span>{m.name}</span>
          <span className="text-xs text-neutral-500">{t(`workspace.role.${m.role}`)}</span>
        </Button>
      ))}
      <Link to="/onboarding" className="text-center text-sm underline">
        {t("workspace.select.create")}
      </Link>
    </AuthCard>
  );
}

type PublicInvitation = { id: string; organizationName: string; inviterName: string; email: string; status: string };

export function InvitationPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const me = useMe();
  const invitation = useQuery({
    queryKey: ["invitation", id],
    queryFn: () => unwrap<PublicInvitation>(api.api.v1.public.invitations[":id"].$get({ param: { id } })),
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () => unwrap(api.api.v1.invitations[":id"].accept.$post({ param: { id } })),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
  });
  const [signingOut, setSigningOut] = useState(false);

  if (invitation.isPending || me.isPending) return <Spinner />;
  const inv = invitation.data;
  if (!inv || inv.status !== "pending") {
    return (
      <AuthCard title="FreeLo">
        <Alert>{t("invitation.invalid")}</Alert>
      </AuthCard>
    );
  }

  const next = encodeURIComponent(`/invitations/${id}`);
  const email = encodeURIComponent(inv.email);
  const user = me.data?.user;
  const sameEmail = user && user.email.toLowerCase() === inv.email.toLowerCase();

  return (
    <AuthCard
      title={t("invitation.title", { workspace: inv.organizationName })}
      subtitle={t("invitation.subtitle", { inviter: inv.inviterName, email: inv.email })}
    >
      {accept.error ? <Alert>{errorMessage(t, accept.error)}</Alert> : null}
      {!user ? (
        <>
          <p className="text-sm text-neutral-700">{t("invitation.signInFirst", { email: inv.email })}</p>
          <Button onClick={() => navigate(`/signup?email=${email}&next=${next}`)}>{t("auth.signup.submit")}</Button>
          <Button variant="secondary" onClick={() => navigate(`/login?email=${email}&next=${next}`)}>
            {t("auth.login.submit")}
          </Button>
        </>
      ) : sameEmail ? (
        <Button onClick={() => accept.mutate()} disabled={accept.isPending}>
          {t("invitation.accept")}
        </Button>
      ) : (
        <>
          <Alert tone="info">{t("invitation.wrongAccount", { current: user.email, email: inv.email })}</Alert>
          <Button
            variant="secondary"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await authClient.signOut();
              await refresh();
              setSigningOut(false);
            }}
          >
            {t("common.signOut")}
          </Button>
        </>
      )}
    </AuthCard>
  );
}
