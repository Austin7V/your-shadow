import type { Metadata } from "next";
import Link from "next/link";
import {
  Footprints,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { ShadowOrb } from "@/app/components/shadow/shadow-orb";
import { Card } from "@/app/components/ui/card";

export const metadata: Metadata = {
  title: "Your personal wellness companion",
  description:
    "Build steady food and movement habits with calm, practical daily support.",
};

const supportAreas = [
  {
    title: "Everyday food",
    description:
      "Keep meal tracking simple and turn daily choices into useful patterns.",
    icon: Utensils,
  },
  {
    title: "Movement that fits",
    description:
      "Build walking and home-workout habits around the day you actually have.",
    icon: Footprints,
  },
  {
    title: "Progress with context",
    description:
      "Notice steady changes over time without letting one imperfect day define you.",
    icon: TrendingUp,
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/80 bg-background">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="Your Shadow home"
            className="inline-flex min-h-11 items-center gap-3 rounded-control font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
            >
              <Sparkles className="size-4" strokeWidth={2.25} />
            </span>
            <span>Your Shadow</span>
          </Link>

          <nav aria-label="Account" className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="motion-press inline-flex min-h-11 items-center justify-center rounded-control px-4 text-sm font-semibold text-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="motion-press hidden min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:px-12 lg:py-24">
        <div className="motion-enter max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Your personal wellness companion
          </p>

          <h1 className="mt-5 text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] font-bold tracking-[-0.04em] text-balance">
            Healthy habits, built one calm step at a time.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
            Your Shadow brings food, movement, and progress into one supportive
            rhythm—so the next useful step always feels within reach.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="motion-press inline-flex min-h-12 items-center justify-center rounded-control border border-primary bg-primary px-6 py-3 text-center font-semibold text-primary-foreground shadow-sm hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Start your journey
            </Link>

            <Link
              href="/login"
              className="motion-press inline-flex min-h-12 items-center justify-center rounded-control border border-border bg-surface px-6 py-3 text-center font-semibold text-foreground shadow-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              I already have an account
            </Link>
          </div>

          <div className="mt-7 flex max-w-2xl items-start gap-3 text-sm leading-6 text-muted-foreground">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-safety"
              strokeWidth={2}
            />
            <p>
              Private by design, made for adults, and grounded in everyday
              wellness—not judgment or medical claims.
            </p>
          </div>
        </div>

        <div className="motion-enter motion-delay-1 relative mx-auto w-full max-w-lg lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute inset-x-12 top-12 bottom-20 rounded-full bg-primary/10"
          />

          <Card
            as="section"
            variant="raised"
            padding="spacious"
            className="relative overflow-hidden"
          >
            <div className="flex min-h-[22rem] flex-col items-center justify-center text-center sm:min-h-[26rem]">
              <ShadowOrb state="idle" size="large" showStatus={false} />

              <p className="mt-7 text-sm font-semibold tracking-[0.16em] text-primary uppercase">
                Shadow is here
              </p>
              <h2 className="mt-2 max-w-sm text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Support that meets you where you are.
              </h2>
              <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                No perfect streak required. Just a clear view of today and a
                practical way forward.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section
        aria-labelledby="support-title"
        className="border-y border-border bg-surface-muted/60"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              Built around real life
            </p>
            <h2
              id="support-title"
              className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-bold tracking-tight text-balance"
            >
              The essentials, connected without the noise.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {supportAreas.map((area) => {
              const Icon = area.icon;

              return (
                <Card
                  key={area.title}
                  as="article"
                  className="motion-enter"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{area.title}</h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {area.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 rounded-panel border border-safety/40 bg-safety/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <span
            aria-hidden="true"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-safety/15 text-safety"
          >
            <ShieldCheck className="size-6" strokeWidth={2} />
          </span>

          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold">
              Wellness support, with a clear boundary
            </h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Your Shadow supports healthy everyday habits. It does not
              diagnose, treat, or replace advice from a qualified healthcare
              professional. For medical concerns, contact an appropriate care
              provider.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="font-semibold text-foreground">Your Shadow</p>
          <p>Calm, private support for healthier everyday habits.</p>
        </div>
      </footer>
    </main>
  );
}
