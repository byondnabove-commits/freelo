import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { UploadCloud } from "lucide-react";

import { uploadLogo } from "@/lib/upload-logo";
import { ApiError } from "@/lib/api";

import { CURRENCIES } from "@freelo/shared/data/currencies";
import { TIMEZONES } from "@freelo/shared/data/timezones";

export function StepOne() {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    register("logo");
  }, [register]);

  const logo = watch("logo");

  const hasLogo =
    typeof logo === "string" && logo.trim().length > 0;

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    clearErrors("logo");

    try {
      const url = await uploadLogo(file);

      setValue("logo", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setError("logo", {
          type: "server",
          message: error.message,
        });
      } else {
        setError("logo", {
          type: "server",
          message: "Failed to upload logo.",
        });
      }

      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-400">
          step 1/4
        </span>

        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Let's setup your studio
        </h2>

        <p className="text-sm text-neutral-500">
          This is what clients will see. Make it yours.
        </p>
      </div>

      <input
        id="logo"
        hidden
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        onChange={handleLogoChange}
      />

      <label
        htmlFor="logo"
        className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
          {hasLogo ? (
            <img
              src={logo}
              alt="Studio logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <UploadCloud className="h-5 w-5 text-[#00B464]" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-neutral-700">
            {hasLogo ? "Logo uploaded" : "Upload your logo"}
          </p>

          <p className="text-[10px] text-neutral-400">
            {hasLogo
              ? "Click to replace your logo"
              : "PNG, JPG, WEBP or SVG · Max 2MB · Optional"}
          </p>
        </div>
      </label>

      {errors.logo && (
        <p className="text-xs text-rose-500">
          {errors.logo.message as string}
        </p>
      )}

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
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="professionalEmail">
            Your professional email *
          </Label>

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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CURRENCIES.map((currency) => (
              <option
                key={currency.code}
                value={currency.code}
              >
                {currency.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}