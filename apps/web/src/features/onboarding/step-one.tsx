import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

export function StepOne() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs text-neutral-400 font-medium">step 1/4</span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Let's setup your studio
        </h2>
        <p className="text-sm text-neutral-500">
          This is what clients will see. Make it yours.
        </p>
      </div>

      {/* Dynamic Drag Drop Input Zone Placeholder Frame */}
      <div className="flex items-center gap-4 p-4 border border-dashed border-neutral-200 bg-neutral-50/50 rounded-xl cursor-pointer hover:bg-neutral-50 transition-all">
        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#00B464]">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-700">
            Upload your logo
          </p>
          <p className="text-[10px] text-neutral-400">
            PNG or SVG · Max 2MB · Optional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="studioName">Studio name</Label>
          <Input
            id="studioName"
            placeholder="Alex Mercer Studio"
            {...register("studioName")}
          />
          {errors.studioName && (
            <p className="text-xs text-rose-500">
              {errors.studioName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName">Your name</Label>
          <Input
            id="ownerName"
            placeholder="Alex Mercer"
            {...register("ownerName")}
          />
          {errors.ownerName && (
            <p className="text-xs text-rose-500">
              {errors.ownerName.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timezone">Your Timezone</Label>
        <select
          id="timezone"
          {...register("timezone")}
          className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Europe/Algiers">UTC+01:00 - Europe/Algiers</option>
          <option value="Europe/London">UTC+00:00 - Europe/London</option>
          <option value="America/New_York">UTC-05:00 - America/New_York</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="professionalEmail">Your professional email *</Label>
          <Input
            id="professionalEmail"
            placeholder="alex@mercerstudio.com"
            {...register("professionalEmail")}
          />
          {errors.professionalEmail && (
            <p className="text-xs text-rose-500">
              {errors.professionalEmail.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency">Your currency</Label>
          <select
            id="currency"
            {...register("currency")}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="USD">USD - US Dollars ($)</option>
            <option value="EUR">EUR - Euros (€)</option>
            <option value="DZD">DZD - Algerian Dinar (DA)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
