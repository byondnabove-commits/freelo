import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// Minimal design primitives (green primary, light UI per the Figma). Replace with
// the full component library when the design system is finalized.

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-green-600 text-white hover:bg-green-700",
        variant === "secondary" && "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
        variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; hint?: string };

export function Field({ label, error, hint, id, name, className, ...props }: FieldProps) {
  const fieldId = id ?? name;
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cx(
          "h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20",
          error ? "border-red-500" : "border-neutral-300",
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg px-3 py-2 text-sm",
        tone === "error" && "bg-red-50 text-red-700",
        tone === "success" && "bg-green-50 text-green-800",
        tone === "info" && "bg-neutral-100 text-neutral-700",
      )}
    >
      {children}
    </div>
  );
}

/** Centered card used by every auth screen. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
        <p className="mb-8 text-lg font-bold">FreeLo</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
        <div className="mt-6 flex flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}

export function Spinner() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">…</div>;
}
