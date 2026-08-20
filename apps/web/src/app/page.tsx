import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Your Shadow
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Build healthier habits with a companion that stays with you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Your Shadow helps you log food, stay active, and make small daily
            decisions that move you toward your goals.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-md bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Create your account
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-border bg-surface px-6 py-3 text-center font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Food</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Log meals in plain language and get clear daily guidance.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Movement</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Build simple home workouts and walking habits around your day.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Daily support</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Stay consistent with supportive check-ins and practical next
              steps.
            </p>
          </article>
        </div>

        <aside className="mt-10 rounded-lg border border-safety bg-surface p-5 text-sm leading-6 text-muted-foreground">
          <span className="font-semibold text-foreground">Important:</span> Your
          Shadow supports healthy everyday habits. It does not provide medical
          diagnosis, treatment, or emergency advice. For medical concerns,
          contact a qualified healthcare professional.
        </aside>
      </section>
    </main>
  );
}
