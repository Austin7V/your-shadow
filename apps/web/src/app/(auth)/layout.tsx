import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ShadowOrb } from "@/app/components/shadow/shadow-orb";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(22rem,0.9fr)_minmax(30rem,1.1fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-border bg-surface-muted p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Link
          href="/"
          aria-label="Your Shadow home"
          className="relative z-10 inline-flex min-h-11 w-fit items-center gap-3 rounded-control font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
          >
            <Sparkles className="size-4" strokeWidth={2.25} />
          </span>
          <span>Your Shadow</span>
        </Link>

        <div className="motion-enter relative z-10 mx-auto w-full max-w-lg py-12">
          <ShadowOrb
            state="idle"
            size="large"
            showStatus={false}
            className="mb-8"
          />

          <p className="text-sm font-semibold tracking-[0.18em] text-primary-content uppercase">
            A space to keep going
          </p>
          <p className="mt-4 text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.06] font-bold tracking-tight text-balance">
            Small steps become a rhythm you can trust.
          </p>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Return to a clear view of your habits, your progress, and the next
            practical step for today.
          </p>
        </div>

        <div className="relative z-10 flex max-w-lg items-start gap-3 text-sm leading-6 text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-safety-content"
            strokeWidth={2}
          />
          <p>
            Your Shadow supports everyday wellness and does not replace
            professional medical advice.
          </p>
        </div>
      </aside>

      <section className="flex min-h-screen flex-col">
        <header className="flex min-h-18 items-center border-b border-border px-5 sm:px-8 lg:hidden">
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
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="motion-enter w-full max-w-lg">{children}</div>
        </div>
      </section>
    </main>
  );
}
