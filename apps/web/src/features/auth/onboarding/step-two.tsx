import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

const SERVICES = ["Brand Identity", "Web Design", "Development", "UI/UX Design", "Motion & Video", "Photography", "Copywriting", "Social Media", "Other"];

export function StepTwo() {
  const { watch, setValue } = useFormContext();
  const selectedServices: string[] = watch("services") || [];
  const activeStyle = watch("workStyle");
  const activeBudget = watch("averageBudget");

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      setValue("services", selectedServices.filter((s) => s !== srv), { shouldValidate: true });
    } else {
      setValue("services", [...selectedServices, srv], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs text-neutral-400 font-medium">step 2/4</span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">What kind of work do you do?</h2>
        <p className="text-sm text-neutral-500">Select all that apply. This personalizes your pipeline and intake form.</p>
      </div>

      {/* Multi-Select Badges */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-700 block">Your Services</label>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((srv) => {
            const isSelected = selectedServices.includes(srv);
            return (
              <button
                type="button"
                key={srv}
                onClick={() => toggleService(srv)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                  isSelected 
                    ? "bg-[#00B464] border-[#00B464] text-white" 
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                )}
              >
                {srv}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Capacity Selections */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-700 block">How do you typically work?</label>
        <div className="space-y-2">
          {[
            { id: "solo", title: "Solo - Just Me", desc: "I handle Everything Myself" },
            { id: "team", title: "Small Team - 2 to 5 People", desc: "We collaborate on projects together" },
            { id: "subcontract", title: "I subcontract Occasionally", desc: "I bring in specialists when needed" }
          ].map((opt) => (
            <div 
              key={opt.id}
              onClick={() => setValue("workStyle", opt.id)}
              className={cn(
                "flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all",
                activeStyle === opt.id ? "border-[#00B464] bg-emerald-50/10" : "border-neutral-200 hover:bg-neutral-50/50"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5", activeStyle === opt.id ? "border-[#00B464]" : "border-neutral-300")}>
                {activeStyle === opt.id && <div className="w-2 h-2 rounded-full bg-[#00B464]" />}
              </div>
              <div>
                <p className={cn("text-xs font-semibold", activeStyle === opt.id ? "text-[#00B464]" : "text-neutral-800")}>{opt.title}</p>
                <p className="text-[10px] text-neutral-400">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Selector Tracks */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-700 block">Average project budget</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "under-1k", label: "Under $1,000", desc: "Small projects & quick turnarounds" },
            { id: "1k-5k", label: "$1,000 - $5,000", desc: "Mid-range projects" },
            { id: "5k-15k", label: "$5,000 - $15,000", desc: "Premium studio work" },
            { id: "15k-plus", label: "$15,000+", desc: "Enterprise & agency level" }
          ].map((bgt) => (
            <div 
              key={bgt.id}
              onClick={() => setValue("averageBudget", bgt.id)}
              className={cn(
                "p-3 border rounded-xl cursor-pointer transition-all flex flex-col justify-between",
                activeBudget === bgt.id ? "border-[#00B464] bg-emerald-50/10" : "border-neutral-200 hover:bg-neutral-50/50"
              )}
            >
              <p className={cn("text-xs font-semibold", activeBudget === bgt.id ? "text-[#00B464]" : "text-neutral-800")}>{bgt.label}</p>
              <p className="text-[10px] text-neutral-400">{bgt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}