import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Auth screens from the Figma "Sign-in" / "Sign-up" frames: on wide screens a white
// card on black with a visual on the left and the form on the right; on phones,
// the form card alone.

/** shortcut: placeholder mark until the real logo is exported from Figma to apps/web/public/logo.svg. */
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <path d="M16 2 4 7v8c0 7.5 5.1 13.6 12 15 6.9-1.4 12-7.5 12-15V7L16 2Z" fill="var(--color-brand)" />
        <path d="M11 22c3-6 6-9 11-11-4 4-6 7-7 11h-4Z" fill="#fff" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">FreeLo</span>
    </div>
  );
}

function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  return (
    <button
      type="button"
      className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
      onClick={() => void i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
    >
      {t("app.language")}
    </button>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 lg:bg-black lg:p-8">
      <div className="flex w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 lg:max-w-6xl lg:p-6 lg:ring-0">
        {/* shortcut: CSS stand-in for the Figma visual; replace with the exported image (apps/web/public/auth-visual.jpg). */}
        <div
          aria-hidden="true"
          className="hidden min-h-[640px] flex-1 rounded-xl lg:block"
          style={{
            background:
              "radial-gradient(80% 60% at 75% 25%, #5eead4 0%, transparent 60%), radial-gradient(90% 70% at 20% 85%, #0d9488 0%, transparent 65%), linear-gradient(160deg, #042f2e 0%, #0f766e 55%, #021b1a 100%)",
          }}
        />
        <div className="flex flex-1 flex-col px-6 py-8 lg:px-16 lg:py-10">
          <div className="flex items-center justify-between">
            <Logo />
            <LanguageSwitch />
          </div>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
            <h1 className="text-center text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-center text-sm text-neutral-500">{subtitle}</p> : null}
            <div className="mt-8 flex flex-col gap-5">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; hint?: string };

/** Underlined input as in the Figma auth frames; password fields get a show/hide toggle. */
export function AuthField({ label, error, hint, name, type, ...props }: AuthFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-neutral-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={`h-10 w-full border-0 border-b bg-transparent px-0 pr-14 text-[15px] outline-none transition-colors focus:border-green-600 ${
            error ? "border-red-500" : "border-neutral-300"
          }`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? t("auth.hide") : t("auth.show")}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase text-neutral-500">
      <span className="h-px flex-1 bg-neutral-200" />
      {label}
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

/** Black "Continue with Google" button from the Figma frames, with the official G mark. */
export function GoogleButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 items-center justify-center gap-3 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50"
    >
      <svg viewBox="0 0 48 48" className="size-5 rounded-full bg-white p-0.5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </button>
  );
}
