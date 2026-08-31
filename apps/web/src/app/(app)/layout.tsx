import Link from "next/link";
import type { ReactNode } from "react";
import { ApplicationNavigation } from "../components/application-navigation";
import { ProtectedRoute } from "@/app/components/auth/protected-route";
import { ProfileRequired } from "@/app/components/auth/profile-required";

type ApplicationLayoutProps = {
  children: ReactNode;
};

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return (
    <ProtectedRoute>
      <ProfileRequired>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4 sm:px-10 lg:px-16">
              <Link
                href="/dashboard"
                className="mr-auto text-lg font-bold text-primary"
              >
                Your Shadow
              </Link>

              <ApplicationNavigation />

              <button
                type="button"
                className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-6 py-10 pb-28 sm:px-10 lg:px-16 md:pb-10">
            {children}
          </main>
        </div>
      </ProfileRequired>
    </ProtectedRoute>
  );
}
