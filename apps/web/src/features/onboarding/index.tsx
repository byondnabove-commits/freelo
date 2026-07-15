import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

import { onboardingSchema, STEP_FIELDS, type OnboardingData } from "./schema";

import { StepOne } from "./step-one";
import { StepTwo } from "./step-two";
import { StepThree } from "./step-three";
import { StepFour } from "./step-four";
import { SidebarStepper } from "./sidebar-stepper";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      studioName: "",
      ownerName: "",
      timezone: "Europe/Algiers",
      professionalEmail: "",
      currency: "USD",
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

  const { trigger } = methods;

  const queryClient = useQueryClient();

  const { mutateAsync: createStudio, isPending: isCreatingStudio } =
    useMutation({
      mutationFn: async (data: OnboardingData) => {
        //----------------------------------------
        // Create organization
        //----------------------------------------

        console.log("1. Creating organization");

        const organization = await authClient.organization.create({
          name: data.studioName,
          slug: data.studioName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        });

        console.log("Organization response", organization);

        if (organization.error) {
          throw new Error(organization.error.message);
        }

        console.log("2. Setting active organization");

        //----------------------------------------
        // Set active organization
        //----------------------------------------

        const active = await authClient.organization.setActive({
          organizationId: organization.data.id,
        });

        console.log("Set active response", active);

        if (active.error) {
          throw new Error(active.error.message);
        }

        //----------------------------------------
        // Save Step 1
        //----------------------------------------

        console.log("3. Calling studio endpoint");

       const response =  await api.post("/api/onboarding/studio", {
          logo: data.logo,
          studioName: data.studioName,
          ownerName: data.ownerName,
          timezone: data.timezone,
          professionalEmail: data.professionalEmail,
          currency: data.currency,
        });

        console.log("Studio response", response.data);

        return organization.data;
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["me"],
        });

        setStep(2);
      },
    });

  const handleNext = async () => {
    const fields = STEP_FIELDS[step - 1];

    const valid = await trigger(fields);

    if (!valid) return;

    switch (step) {
      case 1:
        await createStudio(methods.getValues());
        return;

      case 2:
        setStep(3);
        return;

      case 3:
        setStep(4);
        return;

      default:
        return;
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

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

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isCreatingStudio}
                    className="bg-[#00B464] hover:bg-[#009E56] disabled:bg-neutral-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm"
                  >
                    {isCreatingStudio ? "Saving..." : "Continue →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
