import type { Metadata } from "next";
import { HealthDataForm } from "@/app/components/onboarding/health-data-form";
import { OnboardingPageShell } from "@/app/components/onboarding/onboarding-page-shell";

export const metadata: Metadata = {
  title: "Health and consent",
  description: "Review health constraints, safety information, and consent.",
};

export default function OnboardingHealthPage() {
  return (
    <OnboardingPageShell
      step={2}
      title="Health context, handled carefully"
      description="Add only the information that matters to your everyday wellness guidance, then review each required confirmation."
    >
      <HealthDataForm />
    </OnboardingPageShell>
  );
}
