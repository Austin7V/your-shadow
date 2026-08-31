import Link from "next/link";

export default function OnboardingHealthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-lg border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Step 2 of 2
        </p>

        <h1 className="mt-4 text-3xl font-bold">Health information</h1>

        <p className="mt-3 leading-7 text-muted-foreground">
          Health constraints and consent will be added in the next ticket.
        </p>

        <Link
          href="/onboarding"
          className="mt-6 inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted"
        >
          Back
        </Link>
      </section>
    </main>
  );
}
