import type { ReactNode } from "react";
import { ProtectedRoute } from "@/app/components/auth/protected-route";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
