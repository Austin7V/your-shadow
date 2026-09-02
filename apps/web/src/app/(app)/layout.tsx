import type { ReactNode } from "react";
import { ApplicationShell } from "@/app/components/application-shell";
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
        <ApplicationShell>{children}</ApplicationShell>
      </ProfileRequired>
    </ProtectedRoute>
  );
}
