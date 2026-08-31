import { HealthDataForm } from "@/app/components/onboarding/health-data-form";

export default function OnboardingHealthPage() {
  return (
      <main className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              Step 2 of 2
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Health and safety
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Add relevant health information and review the
              required confirmations before completing your
              profile.
            </p>
          </header>

          <HealthDataForm />
        </div>
      </main>
  );
}