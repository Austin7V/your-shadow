export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-lg border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Your Shadow
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          Let&apos;s build your profile
        </h1>

        <p className="mt-3 leading-7 text-muted-foreground">
          Your personal information and health preferences will be added in the
          next onboarding steps.
        </p>
      </section>
    </main>
  );
}
