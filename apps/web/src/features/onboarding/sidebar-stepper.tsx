import { cn } from "@/lib/utils";

const TIMELINE_STEPS = [
  { id: 1, label: "Studio" },
  { id: 2, label: "Your Work" },
  { id: 3, label: "Intake Form" },
  { id: 4, label: "Ready" },
];

export function SidebarStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="h-full flex flex-col justify-start gap-16">
      {/* Brand Identity Branding Header Container */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">
          F
        </div>
        <span className="font-bold text-xl text-neutral-900 tracking-tight">
          FreeLo
        </span>
      </div>

      {/* Line Node List Stepper Node Track */}
      <div className="relative flex flex-col gap-10 pl-2">
        {/* Vertical Rule Connection Connector Axis line background */}
        <div className="absolute top-2 left-3.75 bottom-2 w-0.5 bg-neutral-200" />

        {/* Dynamic Progress Indicator Mask Line overlay */}
        <div
          className="absolute top-2 left-3.75 w-0.5 bg-[#00B464] transition-all duration-500 ease-in-out"
          style={{ height: `${((Math.min(currentStep, 4) - 1) / 3) * 100}%` }}
        />

        {TIMELINE_STEPS.map((item) => {
          const isActive = currentStep === item.id;
          const isCompleted = currentStep > item.id;

          return (
            <div
              key={item.id}
              className="relative flex items-center gap-4 group z-10"
            >
              <div
                className={cn(
                  "w-7.5 h-7.5 rounded-full border-2 transition-all duration-300 bg-white flex items-center justify-center text-[9px] font-bold",
                  isCompleted && "bg-[#00B464] border-[#00B464] text-white",
                  isActive &&
                    "border-[#00B464] ring-4 ring-emerald-500/10 scale-110",
                  !isActive && !isCompleted && "border-neutral-300",
                )}
              >
                {isCompleted && "✓"}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold tracking-wide transition-colors",
                  isActive ? "text-neutral-900 font-bold" : "text-neutral-400",
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
