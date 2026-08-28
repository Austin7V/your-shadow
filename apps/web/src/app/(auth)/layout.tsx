import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr_1.1fr]">
      <section className="hidden border-r border-border bg-surface p-12 lg:flex lg:flex-col lg:justify-between">
        <Link
          href="/"
          className="w-fit text-sm font-bold tracking-[0.2em] text-primary uppercase"
        >
          Your Shadow
        </Link>

        <div className="max-w-lg">
          <p className="text-sm font-semibold text-primary">
            Your personal wellness companion
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Small daily steps can change everything.
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Build healthier habits, follow your progress, and receive support
            adapted to your goals.
          </p>
        </div>

        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Your Shadow supports everyday wellness and does not replace
          professional medical advice.
        </p>
      </section>

      <section className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-5 lg:hidden">
          <Link
            href="/"
            className="text-sm font-bold tracking-[0.2em] text-primary uppercase"
          >
            Your Shadow
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  );
}
