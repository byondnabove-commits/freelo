import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

import { useNavigate } from "react-router-dom";

import { onboardingSchema, STEP_FIELDS, type OnboardingData } from "./schema";

import { SidebarStepper } from "./sidebar-stepper";
import { StepFour } from "./step-four";
import { StepOne } from "./step-one";
import { StepThree } from "./step-three";
import { StepTwo } from "./step-two";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const queryClient = useQueryClient();

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

  const { trigger, getValues } = methods;

  /*
  ==========================================================
  STEP 1
  ==========================================================
  */

  const { mutateAsync: createStudio, isPending: isCreatingStudio } =
    useMutation({
      mutationFn: async (data: OnboardingData) => {
        const organization = await authClient.organization.create({
          name: data.studioName,
          slug: data.studioName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        });

        if (organization.error) {
          throw new Error(organization.error.message);
        }

        const active = await authClient.organization.setActive({
          organizationId: organization.data.id,
        });

        if (active.error) {
          throw new Error(active.error.message);
        }

        await api.post("/api/onboarding/studio", {
          logo: data.logo,
          studioName: data.studioName,
          ownerName: data.ownerName,
          timezone: data.timezone,
          professionalEmail: data.professionalEmail,
          currency: data.currency,
        });
      },
    });

  /*
  ==========================================================
  STEP 2
  ==========================================================
  */

  const { mutateAsync: saveServices, isPending: isSavingServices } =
    useMutation({
      mutationFn: async (data: OnboardingData) => {
        await api.put("/api/onboarding/services", {
          serviceCategories: data.serviceCategories,
          teamSize: data.teamSize,
          averageBudget: data.averageBudget,
        });
      },
    });

  const { mutateAsync: saveIntakeForm, isPending: isSavingIntakeForm } =
    useMutation({
      mutationFn: async (data: OnboardingData) => {
        await api.put("/api/onboarding/intake-form", {
          intakeFields: data.intakeFields,
        });
      },
    });

  const { mutateAsync: completeOnboarding, isPending: isCompletingOnboarding } =
    useMutation({
      mutationFn: async () => {
        await api.post("/api/onboarding/complete");
      },
    });

  const navigate = useNavigate();

 const handleFinish = async () => {
  try {
    await completeOnboarding();

    await queryClient.invalidateQueries({
      queryKey: ["me"],
    });

    navigate("/dashboard");
  } catch (error) {
    console.error(error);
  }
};

  /*
  ==========================================================
  NEXT
  ==========================================================
  */

  const handleNext = async () => {
  const fields = STEP_FIELDS[step - 1];

  const valid = await trigger(fields);

  if (!valid) return;

  try {
    switch (step) {
      case 1:
        await createStudio(getValues());

        await queryClient.invalidateQueries({
          queryKey: ["me"],
        });

        setStep(2);
        return;

      case 2:
        await saveServices(getValues());

        setStep(3);
        return;

      case 3:
        await saveIntakeForm(getValues());

        setStep(4);
        return;

      default:
        return;
    }
  } catch (error) {
    console.error(error);
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

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      isCreatingStudio || isSavingServices || isSavingIntakeForm
                    }
                    className="bg-[#00B464] hover:bg-[#009E56] disabled:bg-neutral-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm"
                  >
                    {isCreatingStudio || isSavingServices || isSavingIntakeForm
                      ? "Saving..."
                      : "Continue →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={isCompletingOnboarding}
                    className="bg-[#00B464] hover:bg-[#009E56] disabled:bg-neutral-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm"
                  >
                    {isCompletingOnboarding
                      ? "Finishing..."
                      : "Finish Setup 🚀"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
