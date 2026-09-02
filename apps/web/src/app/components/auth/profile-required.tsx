"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/app/components/ui/error-state";
import { LoadingState } from "@/app/components/ui/loading-state";
import { useProfileStatus } from "@/hooks/use-profile-status";

type ProfileRequiredProps = {
  children: ReactNode;
};

export function ProfileRequired({ children }: ProfileRequiredProps) {
  const router = useRouter();
  const { hasProfile, isLoading, error, refreshProfileStatus } =
    useProfileStatus();

  useEffect(() => {
    if (hasProfile === false) {
      router.replace("/onboarding");
    }
  }, [hasProfile, router]);

  if (isLoading || hasProfile === false) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <LoadingState label="Loading your profile..." />
        </div>
      </main>
    );
  }

  if (error !== null) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <ErrorState
            title="Unable to load your profile"
            description={error.message}
            onRetry={() => void refreshProfileStatus()}
          />
        </div>
      </main>
    );
  }

  return children;
}
