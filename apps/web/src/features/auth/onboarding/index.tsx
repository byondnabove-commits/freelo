import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { onboardingSchema, STEP_FIELDS, type OnboardingData } from "./schema";
import { api } from "@/lib/api";

// Sub-step imports...
import { StepOne } from "./step-one";
import { StepTwo } from "./step-two";
import { StepThree } from "./step-three";
import { StepFour } from "./step-four";
import { SidebarStepper } from "./sidebar-stepper";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  // Fixes Error 2: Fully aligned 1:1 types between Zod and RHF
  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      studioName: "",
      ownerName: "",
      timezone: "Europe/Algiers", // Initial defaults assigned cleanly here
      professionalEmail: "",
      currency: "USD", // Initial defaults assigned cleanly here
      serviceCategories: [],
      teamSize: "solo",
      averageBudget: "1000_5000",
      intakeFields: {
        companyName: true,
        projectType: true,
        budgetRange: true,
        preferredTimeline: true,
        projectDescription: true,
        websiteUrl: true,
        attachments: false,
        referralSource: false,
      },
    },
  });

  const { trigger, handleSubmit } = methods;

  const queryClient = useQueryClient();

  const { mutate: submitOnboarding, isPending } = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const orgResult = await authClient.organization.create({
        name: data.studioName,
        slug: data.studioName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
      if (orgResult.error) throw new Error(orgResult.error.message);

      const setActiveResult = await authClient.organization.setActive({
        organizationId: orgResult.data.id,
      });
      const session = await authClient.getSession();

      console.log(session);
      console.log(setActiveResult);
      if (setActiveResult.error) throw new Error(setActiveResult.error.message);

      await api.post("/api/onboarding", {
        ownerName: data.ownerName,
        timezone: data.timezone,
        professionalEmail: data.professionalEmail,
        currency: data.currency,
        logo: data.logo,
        serviceCategories: data.serviceCategories,
        teamSize: data.teamSize,
        averageBudget: data.averageBudget,
        intakeFields: data.intakeFields,
      });

      return orgResult.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setStep(4);
    },
  });

  const handleNext = async () => {
    const activeFields = STEP_FIELDS[step - 1];
    // RHF trigger safely processes the array of FieldPaths
    const isStepValid = await trigger(activeFields);
    if (isStepValid) setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex bg-neutral-50 select-none">
        <div className="w-[320px] bg-neutral-100/70 border-r border-neutral-200/50 p-10 flex flex-col justify-between">
          <SidebarStepper currentStep={step} />
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 max-w-2xl w-full mx-auto px-12 pt-20 pb-12 flex flex-col justify-between">
            <div className="w-full">
              {step === 1 && <StepOne />}
              {step === 2 && <StepTwo />}
              {step === 3 && <StepThree />}
              {step === 4 && <StepFour />}
            </div>

            {step < 4 && (
              <div className="flex items-center justify-between pt-8 border-t border-neutral-100 mt-12">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                >
                  ← Back
                </button>

                <div className="flex items-center gap-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((p) => p + 1)}
                      className="text-xs text-neutral-400 hover:text-neutral-600 font-medium underline underline-offset-4"
                    >
                      Skip for now
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#00B464] hover:bg-[#009E56] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm"
                    >
                      Continue →
                    </button>
                  ) : (
                    // Fixes Error 3: 'data' is now automatically and strictly inferred as OnboardingData
                    <button
                      type="button"
                      onClick={handleSubmit((data) => submitOnboarding(data))}
                      disabled={isPending}
                      className="bg-[#00B464] hover:bg-[#009E56] disabled:bg-neutral-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm"
                    >
                      {isPending
                        ? "Setting up workspace..."
                        : "Finish the setup 🚀"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
