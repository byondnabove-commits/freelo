import { PASSWORD_MIN } from "@freelo/contracts/auth";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Alert, AuthCard, Button, Field } from "@/components/ui";
import { authClient, here } from "@/lib/auth-client";
import { errorMessage } from "@/lib/errors";
import { useRefreshMe } from "@/lib/me";

const googleEnabled = import.meta.env.VITE_GOOGLE_ENABLED === "true";
const formValue = (e: FormEvent<HTMLFormElement>, name: string) =>
  String(new FormData(e.currentTarget).get(name) ?? "").trim();

/** Only same-site relative paths, so `next` can't redirect off-site. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

function GoogleButton({ next }: { next: string | null }) {
  const { t } = useTranslation();
  if (!googleEnabled) return null;
  return (
    <>
      <div className="text-center text-xs uppercase text-neutral-400">{t("common.or")}</div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void authClient.signIn.social({ provider: "google", callbackURL: here(next ?? "/app") })}
      >
        {t("common.google")}
      </Button>
    </>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = formValue(e, "email");
    setBusy(true);
    setError(null);
    setUnverifiedEmail(null);
    const { error: err } = await authClient.signIn.email({ email, password: formValue(e, "password") });
    setBusy(false);
    if (!err) {
      await refresh();
      navigate(next ?? "/app");
    } else if (err.code === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(email);
    } else if (err.status === 429) {
      setError(t("errors.RATE_LIMITED"));
    } else {
      setError(t("auth.login.invalid"));
    }
  }

  return (
    <AuthCard title={t("auth.login.title")} subtitle={t("auth.login.subtitle")}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {error ? <Alert>{error}</Alert> : null}
        {unverifiedEmail ? (
          <Alert tone="info">
            {t("auth.login.notVerified")}{" "}
            <Link className="underline" to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}>
              {t("auth.login.resend")}
            </Link>
          </Alert>
        ) : null}
        <Field label={t("common.email")} name="email" type="email" autoComplete="email" required defaultValue={params.get("email") ?? ""} />
        <Field label={t("common.password")} name="password" type="password" autoComplete="current-password" required />
        <Link to="/forgot-password" className="self-end text-sm text-neutral-600 underline">
          {t("auth.login.forgot")}
        </Link>
        <Button type="submit" disabled={busy}>
          {t("auth.login.submit")}
        </Button>
      </form>
      <GoogleButton next={next} />
      <p className="text-center text-sm text-neutral-600">
        {t("auth.login.noAccount")}{" "}
        <Link className="font-medium text-green-700 underline" to={`/signup${window.location.search}`}>
          {t("auth.login.signUp")}
        </Link>
      </p>
    </AuthCard>
  );
}

export function SignupPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = formValue(e, "name");
    const email = formValue(e, "email");
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    const found: Record<string, string> = {};
    if (name.length < 2) found.name = t("errors.VALIDATION_FAILED");
    if (!email.includes("@")) found.email = t("errors.VALIDATION_FAILED");
    if (password.length < PASSWORD_MIN) found.password = t("auth.signup.passwordHint");
    if (!new FormData(e.currentTarget).get("consent")) found.consent = t("auth.signup.consentRequired");
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      locale: i18n.language === "fr" ? "fr" : "en",
      callbackURL: here(next ?? "/verify-email"),
    });
    setBusy(false);
    if (!error) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } else if (error.code?.startsWith("USER_ALREADY_EXISTS")) {
      setErrors({ email: t("auth.signup.exists") });
    } else if (error.code?.startsWith("PASSWORD")) {
      setErrors({ password: t("auth.signup.weakPassword") });
    } else {
      setErrors({ form: errorMessage(t, error) });
    }
  }

  return (
    <AuthCard title={t("auth.signup.title")} subtitle={t("auth.signup.subtitle")}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {errors.form ? <Alert>{errors.form}</Alert> : null}
        <Field label={t("common.name")} name="name" autoComplete="name" required error={errors.name} />
        <Field label={t("common.email")} name="email" type="email" autoComplete="email" required defaultValue={params.get("email") ?? ""} error={errors.email} />
        <Field
          label={t("common.password")}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          hint={t("auth.signup.passwordHint")}
          error={errors.password}
        />
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input type="checkbox" name="consent" className="mt-0.5 accent-green-600" aria-invalid={Boolean(errors.consent)} />
          <span>{t("auth.signup.consent")}</span>
        </label>
        {errors.consent ? <p className="text-sm text-red-600">{errors.consent}</p> : null}
        <Button type="submit" disabled={busy}>
          {t("auth.signup.submit")}
        </Button>
      </form>
      <GoogleButton next={next} />
      <p className="text-center text-sm text-neutral-600">
        {t("auth.signup.hasAccount")}{" "}
        <Link className="font-medium text-green-700 underline" to={`/login${window.location.search}`}>
          {t("auth.signup.signIn")}
        </Link>
      </p>
    </AuthCard>
  );
}

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function resend() {
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: here("/verify-email") });
    setStatus(error ? "error" : "sent");
  }

  return (
    <AuthCard title={t("auth.verify.title")} subtitle={email ? t("auth.verify.subtitle", { email }) : undefined}>
      {params.get("error") ? <Alert>{t("auth.verify.expired")}</Alert> : null}
      {status === "sent" ? <Alert tone="success">{t("auth.verify.resent")}</Alert> : null}
      {status === "error" ? <Alert>{t("errors.RATE_LIMITED")}</Alert> : null}
      {email ? (
        <Button variant="secondary" onClick={() => void resend()}>
          {t("auth.verify.resend")}
        </Button>
      ) : null}
      <Link to="/login" className="text-center text-sm underline">
        {t("common.backToLogin")}
      </Link>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error: err } = await authClient.requestPasswordReset({
      email: formValue(e, "email"),
      redirectTo: here("/reset-password"),
    });
    // Same answer whether or not the account exists (03-s1 §3.4).
    if (err?.status === 429) setError(t("errors.RATE_LIMITED"));
    else setSent(true);
  }

  return (
    <AuthCard title={t("auth.forgot.title")} subtitle={t("auth.forgot.subtitle")}>
      {sent ? (
        <Alert tone="success">{t("auth.forgot.sent")}</Alert>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {error ? <Alert>{error}</Alert> : null}
          <Field label={t("common.email")} name="email" type="email" autoComplete="email" required />
          <Button type="submit">{t("auth.forgot.submit")}</Button>
        </form>
      )}
      <Link to="/login" className="text-center text-sm underline">
        {t("common.backToLogin")}
      </Link>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"form" | "done" | "invalid">(token && !params.get("error") ? "form" : "invalid");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newPassword = String(new FormData(e.currentTarget).get("password") ?? "");
    if (newPassword.length < PASSWORD_MIN) return setError(t("auth.signup.passwordHint"));
    const { error: err } = await authClient.resetPassword({ newPassword, token: token! });
    if (!err) setState("done");
    else if (err.code?.startsWith("PASSWORD")) setError(t("auth.signup.weakPassword"));
    else setState("invalid");
  }

  return (
    <AuthCard title={t("auth.reset.title")}>
      {state === "done" ? <Alert tone="success">{t("auth.reset.done")}</Alert> : null}
      {state === "invalid" ? <Alert>{t("auth.reset.invalid")}</Alert> : null}
      {state === "form" ? (
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Field
            label={t("common.password")}
            name="password"
            type="password"
            autoComplete="new-password"
            hint={t("auth.signup.passwordHint")}
            error={error}
          />
          <Button type="submit">{t("auth.reset.submit")}</Button>
        </form>
      ) : null}
      <Link to={state === "invalid" ? "/forgot-password" : "/login"} className="text-center text-sm underline">
        {state === "invalid" ? t("auth.forgot.submit") : t("common.backToLogin")}
      </Link>
    </AuthCard>
  );
}
