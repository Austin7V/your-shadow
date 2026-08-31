import { PersonalDataForm } from "@/app/components/onboarding/personal-data-form";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            Step 1 of 2
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s build your profile
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            We use this information to adapt your goals, activity and daily
            recommendations.
          </p>
        </header>

        <PersonalDataForm />
      </div>
    </main>
  );
}
