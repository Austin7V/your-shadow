import type { Metadata } from "next";
import { HealthConstraints } from "@/app/components/profile/health-constraints";
import { ProfileDetails } from "@/app/components/profile/profile-details";
import { WeightHistory } from "@/app/components/profile/weight-history";

export const metadata: Metadata = {
  title: "Profile",
  description:
      "Manage your Your Shadow profile, health constraints and weight history.",
};

export default function AccountPage() {
  return (
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            Your account
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Profile
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Review your personal information, update your
            goals and keep your health and weight data
            current.
          </p>
        </header>

        <div className="space-y-8">
          <ProfileDetails />
          <WeightHistory />
          <HealthConstraints />
        </div>

        <aside className="mt-8 rounded-lg border border-safety bg-surface p-5 text-sm leading-6 text-muted-foreground">
        <span className="font-semibold text-foreground">
          Important:
        </span>{" "}
          Your Shadow supports everyday wellness. It does
          not diagnose medical conditions, provide treatment
          or replace a qualified healthcare professional.
        </aside>
      </div>
  );
}