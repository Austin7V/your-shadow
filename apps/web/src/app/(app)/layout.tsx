import Link from "next/link";
import type { ReactNode } from "react";

type ApplicationLayoutProps = {
  children: ReactNode;
};

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Your Shadow
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Account
            </Link>

            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-16">
        {children}
      </main>
    </div>
  );
}
