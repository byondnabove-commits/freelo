import {
  Building2,
  BriefcaseBusiness,
  ClipboardList,
  Rocket,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TIMELINE_STEPS = [
  {
    id: 1,
    label: "Studio",
    description: "Brand & business information",
    icon: Building2,
  },
  {
    id: 2,
    label: "Your Work",
    description: "Services & pricing",
    icon: BriefcaseBusiness,
  },
  {
    id: 3,
    label: "Intake Form",
    description: "Client qualification",
    icon: ClipboardList,
  },
  {
    id: 4,
    label: "Ready",
    description: "Review & launch",
    icon: Rocket,
  },
];

export function SidebarStepper({ currentStep }: { currentStep: number }) {
  const progress = (currentStep / TIMELINE_STEPS.length) * 100;

  return (
    <aside className="flex h-full flex-col">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00B464] font-bold text-white shadow-sm">
            F
          </div>

          <div>
            <p className="font-semibold text-neutral-900">FreeLo</p>
            <p className="text-xs text-neutral-500">Workspace Setup</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Welcome 👋
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Let's configure your workspace.
            <br />
            This usually takes less than 2 minutes.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Progress
          </span>

          <span className="text-xs font-semibold text-neutral-700">
            {currentStep} / {TIMELINE_STEPS.length}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-[#00B464] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-10 flex-1">
        <div className="relative flex flex-col gap-3">
          {TIMELINE_STEPS.map((step) => {
            const Icon = step.icon;

            const active = currentStep === step.id;
            const completed = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300",
                  completed && "border-emerald-200 bg-emerald-50",
                  active && "border-[#00B464] bg-emerald-50/50 shadow-sm",
                  !active &&
                    !completed &&
                    "border-transparent hover:bg-neutral-50",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
                    completed && "border-[#00B464] bg-[#00B464] text-white",
                    active && "border-[#00B464] bg-white text-[#00B464]",
                    !active &&
                      !completed &&
                      "border-neutral-200 bg-white text-neutral-400",
                  )}
                >
                  {completed ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-medium",
                      active || completed
                        ? "text-neutral-900"
                        : "text-neutral-500",
                    )}
                  >
                    {step.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-medium text-neutral-900">
          Your progress is saved automatically.
        </p>

        <p className="mt-1 text-xs leading-5 text-neutral-500">
          You can safely leave and continue your onboarding later.
        </p>
      </div>
    </aside>
  );
}
