import {
  BUDGET_BRACKETS,
  LOGO_MAX_BYTES,
  LOGO_TYPES,
  MAX_ONBOARDING_INVITES,
  MAX_ONBOARDING_SERVICES,
  SERVICE_SUGGESTIONS,
  TEAM_SIZES,
  type BudgetBracket,
  type OnboardingState,
  type TeamSize,
} from "@freelo/contracts/onboarding";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useSearchParams } from "react-router";

import { Logo } from "@/components/auth-layout";
import { Alert, Button, Field, Spinner } from "@/components/ui";
import { api, ApiError, unwrap } from "@/lib/api";
import { clearAllDrafts, clearDraft, useDraft } from "@/lib/draft";
import { errorMessage } from "@/lib/errors";
import { useMe, useRefreshMe } from "@/lib/me";

type Step = 1 | 2 | 3 | "ready";

// Shape checks for browser drafts (see useDraft).
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isBusinessDraft = (v: unknown): v is { name: string } => isRecord(v) && typeof v.name === "string";
const isSkillsDraft = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string");
const isWorkDraft = (v: unknown): v is { teamSize: TeamSize | null; typicalBudget: BudgetBracket | null; invites: string } =>
  isRecord(v) &&
  (v.teamSize === null || (TEAM_SIZES as readonly unknown[]).includes(v.teamSize)) &&
  (v.typicalBudget === null || (BUDGET_BRACKETS as readonly unknown[]).includes(v.typicalBudget)) &&
  typeof v.invites === "string";

export function OnboardingPage() {
  const me = useMe();
  const [params] = useSearchParams();
  const isNew = params.get("new") === "1";
  const state = useQuery({
    queryKey: ["onboarding", me.data?.activeOrganizationId, isNew],
    queryFn: () => unwrap<OnboardingState>(api.api.v1.onboarding.$get()),
    enabled: Boolean(me.data),
  });

  if (!me.data || state.isPending) return <Spinner />;
  if (me.data.onboarding?.completed && !isNew) return <Navigate to="/app" replace />;
  if (!state.data) return <Spinner />;

  // "Create another workspace" starts from a blank step 1.
  const data: OnboardingState = isNew
    ? { step: 0, completed: false, business: null, services: [], work: { teamSize: null, typicalBudget: null } }
    : state.data;
  return <Wizard key={isNew ? "new" : "resume"} userId={me.data.user.id} initial={data} />;
}

function Wizard({ userId, initial }: { userId: string; initial: OnboardingState }) {
  const [step, setStep] = useState<Step>(initial.completed ? "ready" : (Math.min(initial.step + 1, 3) as 1 | 2 | 3));
  const [data, setData] = useState(initial);
  const reload = async () => setData(await unwrap<OnboardingState>(api.api.v1.onboarding.$get()));

  return (
    <OnboardingLayout step={step}>
      {step === 1 ? (
        <BusinessStep userId={userId} data={data} onDone={async () => (await reload(), setStep(2))} />
      ) : step === 2 ? (
        <ServicesStep userId={userId} data={data} onBack={() => setStep(1)} onDone={async () => (await reload(), setStep(3))} />
      ) : step === 3 ? (
        <WorkStep userId={userId} data={data} onBack={() => setStep(2)} onDone={async () => (await reload(), setStep("ready"))} />
      ) : (
        <Ready data={data} />
      )}
    </OnboardingLayout>
  );
}

function OnboardingLayout({ step, children }: { step: Step; children: ReactNode }) {
  const { t } = useTranslation();
  const current = step === "ready" ? 4 : step;
  const steps = ["business", "services", "work", "ready"] as const;
  return (
    <main className="flex min-h-screen bg-white">
      <aside className="hidden w-72 shrink-0 flex-col gap-10 bg-neutral-100 p-8 md:flex">
        <Logo />
        <ol className="flex flex-col">
          {steps.map((s, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            return (
              <li key={s} className="flex gap-3" aria-current={active ? "step" : undefined}>
                <div className="flex flex-col items-center">
                  <span
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                      done || active ? "bg-green-600 text-white" : "bg-neutral-300 text-neutral-600"
                    }`}
                  >
                    {done ? "✓" : n}
                  </span>
                  {n < steps.length ? <span className={`my-1 h-10 w-0.5 ${done ? "bg-green-600" : "bg-neutral-300"}`} /> : null}
                </div>
                <span className={`pt-1 text-sm ${active ? "font-semibold text-neutral-900" : "text-neutral-500"}`}>
                  {t(`onboarding.steps.${s}`)}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
      <section className="flex flex-1 justify-center overflow-y-auto px-6 py-10 md:px-16">
        <div className="w-full max-w-2xl">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          {step !== "ready" ? <p className="mb-2 text-xs text-neutral-500">{t("onboarding.stepOf", { n: current, total: 3 })}</p> : null}
          {children}
        </div>
      </section>
    </main>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-neutral-600">{subtitle}</p>
    </header>
  );
}

function StepFooter({ onBack, busy, submitLabel, onSkip }: { onBack?: () => void; busy: boolean; submitLabel?: string; onSkip?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
      {onBack ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          ← {t("onboarding.back")}
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-4">
        {onSkip ? (
          <button type="button" className="text-sm text-neutral-600 underline underline-offset-4" onClick={onSkip} disabled={busy}>
            {t("onboarding.skip")}
          </button>
        ) : null}
        <Button type="submit" disabled={busy}>
          {submitLabel ?? t("common.continue")} →
        </Button>
      </div>
    </div>
  );
}

function RestoredNote({ restored, undo }: { restored: boolean; undo: () => void }) {
  const { t } = useTranslation();
  if (!restored) return null;
  return (
    <Alert tone="info">
      {t("onboarding.restored")}{" "}
      <button type="button" className="underline" onClick={undo}>
        {t("onboarding.undo")}
      </button>
    </Alert>
  );
}

function BusinessStep({ userId, data, onDone }: { userId: string; data: OnboardingState; onDone: () => Promise<void> }) {
  const { t } = useTranslation();
  const refresh = useRefreshMe();
  const navigate = useNavigate();
  const draft = useDraft(userId, 1, { name: data.business?.name ?? "" }, isBusinessDraft);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(data.business?.logoUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pickLogo(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return setError(t("onboarding.business.logoType"));
    if (file.size > LOGO_MAX_BYTES) return setError(t("onboarding.business.logoSize"));
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = draft.value.name.trim();
    if (name.length < 2) return setError(t("onboarding.business.nameRequired"));
    setBusy(true);
    setError(null);
    try {
      // The server makes the new workspace active.
      await unwrap(api.api.v1.onboarding.business.$post({ json: { name } }));
      if (logo) {
        const form = new FormData();
        form.append("logo", logo);
        const res = await fetch("/api/v1/workspace/logo", { method: "POST", body: form, credentials: "include" });
        await unwrap(res);
      }
      clearDraft(userId, 1);
      // /me now points at this workspace; dropping `?new=1` makes a refresh resume instead of starting over.
      await refresh();
      navigate("/onboarding", { replace: true });
      await onDone();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 413 ? t("onboarding.business.logoSize") : errorMessage(t, err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <StepHeader title={t("onboarding.business.title")} subtitle={t("onboarding.business.subtitle")} />
      <div className="flex flex-col gap-6">
        <RestoredNote restored={draft.restored} undo={draft.undo} />
        {error ? <Alert>{error}</Alert> : null}
        <div className="flex items-center gap-4">
          <label className="flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-green-500 bg-green-50 text-2xl text-green-700 focus-within:ring-2 focus-within:ring-green-600">
            {preview ? <img src={preview} alt="" className="size-full object-contain" /> : "↑"}
            <input type="file" accept={LOGO_TYPES.join(",")} className="sr-only" onChange={(e) => pickLogo(e.target.files?.[0])} />
            <span className="sr-only">{t("onboarding.business.logo")}</span>
          </label>
          <div>
            <p className="text-sm font-medium">{t("onboarding.business.logo")}</p>
            <p className="text-xs text-neutral-500">{t("onboarding.business.logoHint")}</p>
          </div>
        </div>
        <Field
          label={t("onboarding.business.name")}
          name="name"
          placeholder={t("workspace.new.placeholder")}
          value={draft.value.name}
          onChange={(e) => draft.setValue({ name: e.target.value })}
          maxLength={80}
          autoFocus
        />
      </div>
      <StepFooter busy={busy} />
    </form>
  );
}

function ServicesStep({ userId, data, onBack, onDone }: { userId: string; data: OnboardingState; onBack: () => void; onDone: () => Promise<void> }) {
  const { t } = useTranslation();
  // Skills only: prices are set later, on each devis.
  const draft = useDraft(userId, 2, data.services.map((s) => s.name), isSkillsDraft);
  const selected = draft.value;
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSelected = (name: string) => selected.some((s) => s.toLowerCase() === name.toLowerCase());
  const toggle = (name: string) =>
    draft.setValue(isSelected(name) ? selected.filter((s) => s.toLowerCase() !== name.toLowerCase()) : [...selected, name]);
  const suggestions = SERVICE_SUGGESTIONS.map((key) => t(`onboarding.services.chips.${key}`));
  const customOnes = selected.filter((s) => !suggestions.some((l) => l.toLowerCase() === s.toLowerCase()));

  function addCustom() {
    const name = custom.trim();
    if (!name || isSelected(name)) return setCustom("");
    if (selected.length >= MAX_ONBOARDING_SERVICES) return setError(t("onboarding.services.tooMany", { max: MAX_ONBOARDING_SERVICES }));
    draft.setValue([...selected, name.slice(0, 80)]);
    setCustom("");
  }

  async function save(names: string[]) {
    setBusy(true);
    setError(null);
    try {
      await unwrap(api.api.v1.onboarding.services.$put({ json: { services: names.map((name) => ({ name, price: null, unit: "project" })) } }));
      clearDraft(userId, 2);
      await onDone();
    } catch (err) {
      setError(errorMessage(t, err));
    } finally {
      setBusy(false);
    }
  }

  const chip = (name: string, removable = false) => (
    <button
      key={name}
      type="button"
      aria-pressed={isSelected(name)}
      onClick={() => toggle(name)}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
        isSelected(name) ? "bg-green-600 text-white" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
      }`}
    >
      {name}
      {removable ? <span aria-hidden="true"> ×</span> : null}
    </button>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save(selected);
      }}
      noValidate
    >
      <StepHeader title={t("onboarding.services.title")} subtitle={t("onboarding.services.subtitle")} />
      <div className="flex flex-col gap-6">
        <RestoredNote restored={draft.restored} undo={draft.undo} />
        {error ? <Alert>{error}</Alert> : null}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((label) => chip(label))}
          {customOnes.map((name) => chip(name, true))}
        </div>
        <div className="flex gap-2">
          <input
            aria-label={t("onboarding.services.custom")}
            placeholder={t("onboarding.services.customPlaceholder")}
            value={custom}
            maxLength={80}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            className="h-10 flex-1 rounded-lg border border-neutral-300 px-3 text-sm"
          />
          <Button type="button" variant="secondary" onClick={addCustom}>
            + {t("onboarding.services.add")}
          </Button>
        </div>
      </div>
      <StepFooter onBack={onBack} busy={busy} onSkip={() => void save([])} />
    </form>
  );
}

function Choice<T extends string>({ name, options, value, onChange, label }: { name: string; options: readonly T[]; value: T | null; onChange: (v: T) => void; label: (v: T) => string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label
          key={o}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            value === o ? "border-green-600 bg-green-50 font-medium" : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="accent-green-600" />
          {label(o)}
        </label>
      ))}
    </div>
  );
}

function WorkStep({ userId, data, onBack, onDone }: { userId: string; data: OnboardingState; onBack: () => void; onDone: () => Promise<void> }) {
  const { t } = useTranslation();
  const draft = useDraft(userId, 3, { ...data.work, invites: "" }, isWorkDraft);
  const v = draft.value;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(input: typeof v) {
    const invites = input.teamSize && input.teamSize !== "solo" ? input.invites.split(/[\s,;]+/).filter(Boolean) : [];
    if (invites.length > MAX_ONBOARDING_INVITES) return setError(t("onboarding.work.tooManyInvites", { max: MAX_ONBOARDING_INVITES }));
    if (invites.some((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))) return setError(t("onboarding.work.inviteInvalid"));
    setBusy(true);
    setError(null);
    try {
      await unwrap(api.api.v1.onboarding.work.$put({ json: { teamSize: input.teamSize, typicalBudget: input.typicalBudget, invites } }));
      await unwrap(api.api.v1.onboarding.complete.$post());
      clearAllDrafts(userId);
      await onDone();
    } catch (err) {
      setError(errorMessage(t, err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save(v);
      }}
      noValidate
    >
      <StepHeader title={t("onboarding.work.title")} subtitle={t("onboarding.work.subtitle")} />
      <div className="flex flex-col gap-8">
        <RestoredNote restored={draft.restored} undo={draft.undo} />
        {error ? <Alert>{error}</Alert> : null}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold">{t("onboarding.work.team")}</legend>
          <Choice name="team" options={TEAM_SIZES} value={v.teamSize} onChange={(teamSize) => draft.setValue({ ...v, teamSize })} label={(o) => t(`onboarding.work.teamSizes.${o}`)} />
        </fieldset>
        {v.teamSize && v.teamSize !== "solo" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invites" className="text-sm font-semibold">
              {t("onboarding.work.invites")}
            </label>
            <textarea
              id="invites"
              rows={3}
              value={v.invites}
              onChange={(e) => draft.setValue({ ...v, invites: e.target.value })}
              placeholder="sara@studio.dz, karim@studio.dz"
              className="rounded-lg border border-neutral-300 p-3 text-sm"
            />
            <p className="text-xs text-neutral-500">{t("onboarding.work.invitesHint", { max: MAX_ONBOARDING_INVITES })}</p>
          </div>
        ) : null}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold">{t("onboarding.work.budget")}</legend>
          <Choice name="budget" options={BUDGET_BRACKETS} value={v.typicalBudget} onChange={(typicalBudget) => draft.setValue({ ...v, typicalBudget })} label={(o) => t(`onboarding.work.budgets.${o}`)} />
        </fieldset>
      </div>
      <StepFooter onBack={onBack} busy={busy} submitLabel={t("onboarding.finish")} onSkip={() => void save({ teamSize: null, typicalBudget: null, invites: "" })} />
    </form>
  );
}

function Ready({ data }: { data: OnboardingState }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const refresh = useRefreshMe();
  const items = [
    { label: t("onboarding.ready.items.business"), done: true },
    { label: t("onboarding.ready.items.services"), done: data.services.length > 0 },
    { label: t("onboarding.ready.items.details"), done: false },
  ];
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">✓</div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t("onboarding.ready.title")}</h1>
      <p className="mt-2 text-neutral-600">{t("onboarding.ready.subtitle", { name: data.business?.name ?? "" })}</p>
      {data.business?.logoUrl ? <img src={data.business.logoUrl} alt="" className="mt-6 size-16 rounded-lg object-contain" /> : null}
      <ul className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <span className={`flex size-5 items-center justify-center rounded-full text-xs ${item.done ? "bg-green-600 text-white" : "border border-neutral-300"}`}>
              {item.done ? "✓" : ""}
            </span>
            <span className={item.done ? "text-neutral-500 line-through" : ""}>{item.label}</span>
          </li>
        ))}
      </ul>
      <Button
        className="mt-10"
        onClick={async () => {
          // Refreshing /me earlier would redirect away from this screen.
          await refresh();
          navigate("/app");
        }}
      >
        {t("onboarding.ready.cta")} →
      </Button>
    </div>
  );
}
