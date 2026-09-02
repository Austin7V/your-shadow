"use client";

import { CircleAlert } from "lucide-react";
import {
  LIGHT_THEME_COLOR,
  THEME_BOOTSTRAP_SCRIPT,
} from "@/app/components/theme/theme-bootstrap";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <title>Unexpected error | Your Shadow</title>
        <meta name="theme-color" content={LIGHT_THEME_COLOR} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16 text-foreground sm:px-6">
          <section
            role="alert"
            className="motion-enter w-full max-w-lg rounded-card border border-error/40 bg-surface p-6 text-center shadow-md sm:p-10"
          >
            <CircleAlert
              aria-hidden="true"
              className="mx-auto size-10 text-error-content"
            />

            <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-error-content uppercase">
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
              className="motion-press mt-7 inline-flex min-h-11 items-center justify-center rounded-control border border-primary-action bg-primary-action px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:border-primary-action-hover hover:bg-primary-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
