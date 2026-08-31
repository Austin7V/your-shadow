import type { ReactNode } from "react";
import { OnboardingRequired } from "@/app/components/auth/onboarding-required";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export default function OnboardingLayout({
                                           children,
                                         }: OnboardingLayoutProps) {
  return (
      <ProtectedRoute>
        <OnboardingRequired>
          {children}
        </OnboardingRequired>
      </ProtectedRoute>
  );
}