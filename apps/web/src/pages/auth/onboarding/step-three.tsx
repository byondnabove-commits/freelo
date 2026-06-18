import { useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

export function StepThree() {
  const { watch, setValue } = useFormContext();
  const values = watch("intakeFields") || {};

  const toggleField = (key: string) => {
    setValue(`intakeFields.${key}`, !values[key]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs text-neutral-400 font-medium">step 3/4</span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Set up your intake form.</h2>
        <p className="text-sm text-neutral-500">Toggle the fields you want to ask clients before the discovery call. Your form goes live instantly.</p>
      </div>

      <div className="border border-neutral-100 rounded-xl divide-y divide-neutral-100 bg-white shadow-sm overflow-hidden">
        
        {/* Read Only Explicitly Required Core Elements */}
        <div className="flex items-center justify-between p-4 bg-neutral-50/50">
          <div>
            <p className="text-xs font-semibold text-neutral-700">Fullname</p>
            <p className="text-[10px] text-neutral-400">Always required</p>
          </div>
          <span className="text-[10px] font-bold bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded uppercase">Mandatory</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-neutral-50/50">
          <div>
            <p className="text-xs font-semibold text-neutral-700">Email address</p>
            <p className="text-[10px] text-neutral-400">Always required</p>
          </div>
          <span className="text-[10px] font-bold bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded uppercase">Mandatory</span>
        </div>

        {/* Mutable Toggle Properties */}
        {[
          { id: "companyName", label: "Company/Brand name", desc: "Who they're representing" },
          { id: "projectType", label: "Project type", desc: "Branding, web design, development..." },
          { id: "budgetRange", label: "Budget range", desc: "Helps you pre-qualify leads" },
          { id: "preferredTimeline", label: "Preferred timeline", desc: "When do they need it done?" },
          { id: "projectDescription", label: "Project description", desc: "Tell me about your project (long text)" },
          { id: "websiteUrl", label: "Website URL", desc: "Their existing site for reference" },
          { id: "attachments", label: "Attach a brief or inspiration", desc: "File upload — PDF, images" },
          { id: "referralSource", label: "How did you find me?", desc: "Referral tracking" }
        ].map((field) => (
          <div key={field.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/30 transition-all">
            <div>
              <p className="text-xs font-semibold text-neutral-700">{field.label}</p>
              <p className="text-[10px] text-neutral-400">{field.desc}</p>
            </div>
            <Switch 
              checked={!!values[field.id]} 
              onCheckedChange={() => toggleField(field.id)}
            />
          </div>
        ))}

      </div>
    </div>
  );
}