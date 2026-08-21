"use client";

import { CircleAlert } from "lucide-react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
          <section
            role="alert"
            className="w-full max-w-lg rounded-xl border border-error bg-surface p-8 text-center shadow-md sm:p-10"
          >
            <CircleAlert
              aria-hidden="true"
              className="mx-auto size-10 text-error"
            />

            <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-error uppercase">
              Unexpected error
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Something went wrong
            </h1>

            <p className="mt-4 leading-7 text-muted-foreground">
              We could not complete this action. Please try again.
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
