"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/app/components/ui/error-state";
import { LoadingState } from "@/app/components/ui/loading-state";
import { useProfileStatus } from "@/hooks/use-profile-status";

type OnboardingRequiredProps = {
  children: ReactNode;
};

export function OnboardingRequired({
  children,
}: OnboardingRequiredProps) {
  const router = useRouter();
  const { hasProfile, isLoading, error, refreshProfileStatus } =
    useProfileStatus();

  useEffect(() => {
    if (hasProfile === true) {
      router.replace("/dashboard");
    }
  }, [hasProfile, router]);

  if (isLoading || hasProfile === true) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <LoadingState label="Checking your profile..." />
        </div>
      </main>
    );
  }

  if (error !== null) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <ErrorState
            title="Unable to check your profile"
            description={error.message}
            onRetry={() => void refreshProfileStatus()}
          />
        </div>
      </main>
    );
  }

  return children;
}
