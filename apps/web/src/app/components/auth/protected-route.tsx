"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/app/components/ui/error-state";
import { LoadingState } from "@/app/components/ui/loading-state";
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
        <div className="w-full max-w-lg">
          <LoadingState label="Loading your account..." />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <ErrorState
            title="Unable to load your account"
            description={error?.message ?? "Please try again."}
            onRetry={() => void refreshCurrentUser()}
          />
        </div>
      </main>
    );
  }

  return children;
}
