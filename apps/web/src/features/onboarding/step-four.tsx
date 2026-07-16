import { useFormContext } from "react-hook-form";
import { CheckCircle2, Circle } from "lucide-react";

export function StepFour() {
  const { watch } = useFormContext();

  const studioName = watch("studioName") || "Your Studio";
  const ownerName = watch("ownerName") || "Studio Owner";
  const teamSize = watch("teamSize") === "solo" ? "Solo" : "Team";

  return (
    <div className="space-y-8 flex flex-col items-center text-center py-6 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#00B464]">
        <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          You're almost ready.
        </h2>

        <p className="text-sm text-neutral-500 max-w-md">
          Review your workspace one last time. When everything looks good, click{" "}
          <span className="font-medium">Finish Setup</span> to enter your
          dashboard.
        </p>
      </div>

      {/* Workspace Summary */}
      <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl w-full max-w-sm text-left">
        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 uppercase">
          {ownerName.charAt(0)}
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-900">{ownerName}</p>

          <p className="text-[11px] text-neutral-500">
            {studioName} · {teamSize}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="w-full max-w-sm text-left space-y-3">
        {[
          {
            label: "Studio profile configured",
            completed: true,
          },
          {
            label: "Services configured",
            completed: true,
          },
          {
            label: "Intake form configured",
            completed: true,
          },
          {
            label: "Workspace ready to activate",
            completed: true,
          },
          {
            label: "Finish setup to access your dashboard",
            completed: false,
          },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-[#00B464]" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300" />
            )}

            <span
              className={
                item.completed
                  ? "text-neutral-800 font-medium"
                  : "text-neutral-500"
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
