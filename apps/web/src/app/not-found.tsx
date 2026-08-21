import { CircleHelp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 text-center shadow-md sm:p-10">
        <CircleHelp
          aria-hidden="true"
          className="mx-auto size-10 text-primary"
        />

        <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
