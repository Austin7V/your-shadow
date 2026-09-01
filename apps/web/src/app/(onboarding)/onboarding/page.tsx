import type { Metadata } from "next";
import { OnboardingPageShell } from "@/app/components/onboarding/onboarding-page-shell";
import { PersonalDataForm } from "@/app/components/onboarding/personal-data-form";

export const metadata: Metadata = {
  title: "Set up your profile",
  description: "Add your personal context, goal, and starting point.",
};

export default function OnboardingPage() {
  return (
    <OnboardingPageShell
      step={1}
      title="Let’s shape your starting point"
      description="Add the context Your Shadow needs to organise your goals and everyday guidance. You can review each field before continuing."
    >
      <PersonalDataForm />
    </OnboardingPageShell>
  );
}
