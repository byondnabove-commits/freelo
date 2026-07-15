import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";

export function StepFour() {
  const { watch } = useFormContext();
  const navigate = useNavigate();
  const studioName = watch("studioName") || "Your Studio";
  const ownerName = watch("ownerName") || "Studio Owner";
  const teamSize = watch("teamSize") === "solo" ? "Solo" : "Team";

  return (
    <div className="space-y-8 flex flex-col items-center text-center py-6 animate-in zoom-in-95 duration-500">
      
      {/* Visual Success Accent Graphic */}
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#00B464]">
        <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Your studio is ready.</h2>
        <p className="text-sm text-neutral-500">Everything is set up and live. Here's what's waiting for you.</p>
      </div>

      {/* User Dynamic Summary Badge Frame */}
      <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200/50 rounded-xl w-full max-w-sm text-left">
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-600 uppercase">
          {ownerName.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-800">{ownerName}</p>
          <p className="text-[10px] text-neutral-400">{studioName} · {teamSize}</p>
        </div>
      </div>

      {/* Summary Onboarding Checklists */}
      <div className="w-full max-w-sm text-left space-y-3 pt-4">
        {[
          { label: "Studio profile set up", completed: true },
          { label: "Intake form live at your URL", completed: true },
          { label: "Create your first project", completed: false },
          { label: "Send your intake form to a lead", completed: false },
          { label: "Send your first proposal", completed: false },
        ].map((task, i) => (
          <div key={i} className="flex items-center gap-3 text-xs font-medium">
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-[#00B464] fill-emerald-50" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300" />
            )}
            <span className={task.completed ? "text-neutral-800 font-semibold" : "text-neutral-400"}>
              {task.label}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/dashboard", { replace: true })}
        className="w-full max-w-sm mt-6 bg-[#00B464] hover:bg-[#009E56] text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2"
      >
        Go to my Dashboard →
      </button>

    </div>
  );
}