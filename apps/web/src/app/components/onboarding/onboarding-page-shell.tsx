import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type OnboardingStep = 1 | 2;

type OnboardingPageShellProps = {
  step: OnboardingStep;
  title: string;
  description: string;
  children: ReactNode;
};

const onboardingSteps = [
  { number: 1, label: "Profile and goals" },
  { number: 2, label: "Health and consent" },
] as const;

export function OnboardingPageShell({
  step,
  title,
  description,
  children,
}: OnboardingPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
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

          <p className="hidden text-sm font-medium text-muted-foreground sm:block">
            Private account setup
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="motion-enter grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.18em] text-primary-content uppercase">
              Step {step} of {onboardingSteps.length}
            </p>
            <h1 className="mt-3 text-[clamp(2rem,6vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>

          <nav
            aria-label="Onboarding progress"
            className="rounded-card border border-border bg-surface-muted p-4"
          >
            <div
              role="progressbar"
              aria-label="Onboarding completion"
              aria-valuemin={1}
              aria-valuemax={onboardingSteps.length}
              aria-valuenow={step}
              aria-valuetext={`Step ${step} of ${onboardingSteps.length}`}
              className="h-2 overflow-hidden rounded-full bg-border"
            >
              <div
                className={`h-full rounded-full bg-progress transition-[width] duration-data ${
                  step === 1 ? "w-1/2" : "w-full"
                }`}
              />
            </div>

            <ol className="mt-4 grid grid-cols-2 gap-3">
              {onboardingSteps.map((item) => {
                const isComplete = item.number < step;
                const isCurrent = item.number === step;

                return (
                  <li
                    key={item.number}
                    aria-current={isCurrent ? "step" : undefined}
                    className={
                      isCurrent || isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                        isComplete
                          ? "border border-success/40 bg-success/10 text-success-content"
                          : isCurrent
                            ? "bg-primary-action text-primary-foreground"
                            : "border border-border bg-surface"
                      }`}
                    >
                      {isComplete ? <Check className="size-4" /> : item.number}
                    </span>
                    <span className="mt-2 block text-xs leading-5 font-semibold sm:text-sm">
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
