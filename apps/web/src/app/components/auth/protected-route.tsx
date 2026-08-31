"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { status, error, refreshCurrentUser } = useCurrentUser();

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const returnTo = `${window.location.pathname}${window.location.search}`;

    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading your account...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="text-error">
            {error?.message ?? "Unable to load your account."}
          </p>

          <button
            type="button"
            onClick={() => void refreshCurrentUser()}
            className="mt-4 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return children;
}
