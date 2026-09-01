import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { FeaturePageShell } from "@/app/components/feature-page-shell";
import { AccountDeletion } from "@/app/components/profile/account-deletion";
import { HealthConstraints } from "@/app/components/profile/health-constraints";
import { ProfileDetails } from "@/app/components/profile/profile-details";
import { WeightHistory } from "@/app/components/profile/weight-history";
import { Card } from "@/app/components/ui/card";
import { SafetyState } from "@/app/components/ui/safety-state";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Manage your profile, health constraints, weight history, and account privacy.",
};

function PrivacySummary() {
  return (
    <Card
      as="section"
      variant="muted"
      aria-labelledby="profile-privacy-title"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-center"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-safety/10 text-safety"
        >
          <LockKeyhole className="size-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-safety uppercase">
            Privacy by design
          </p>
          <h2
            id="profile-privacy-title"
            className="mt-2 text-2xl font-bold tracking-tight"
          >
            Your private context stays in your account.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Sensitive profile details appear only where you intentionally
            review and manage them.
          </p>
        </div>
      </div>

      <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
        <li className="flex items-start gap-3">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-success"
            strokeWidth={2}
          />
          <span>Stored profile, health, and weight values are encrypted by the API.</span>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-success"
            strokeWidth={2}
          />
          <span>Private data requests are scoped to the signed-in account on the server.</span>
        </li>
      </ul>
    </Card>
  );
}

export default function AccountPage() {
  return (
    <FeaturePageShell
      eyebrow="Your account"
      title="Profile and privacy"
      description="Review your personal context, update your goal, and manage the private health and weight information connected to your account."
    >
      <PrivacySummary />

      <ProfileDetails />
      <WeightHistory />
      <HealthConstraints />

      <SafetyState
        title="Wellness support, not medical care"
        description="Your Shadow supports everyday wellness. It does not diagnose medical conditions, provide treatment, or replace a qualified healthcare professional."
      />

      <AccountDeletion />
    </FeaturePageShell>
  );
}
