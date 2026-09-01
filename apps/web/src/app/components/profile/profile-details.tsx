"use client";

import { LockKeyhole, Pencil, Target, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SuccessState } from "@/app/components/ui/success-state";
import { useProfile } from "@/hooks/use-profile";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import { updateCurrentProfile } from "@/lib/api/profile-api";
import type { ProfileResponse } from "@/lib/contracts";
import { profileGoalOptions } from "@/lib/onboarding/personal-data";
import {
  createProfileEditDraft,
  createProfileUpdateRequest,
  getProfileGoalLabel,
  validateProfileEdit,
  type ProfileEditDraft,
  type ProfileEditErrors,
} from "@/lib/profile/profile-edit";

type ProfileEditFormProps = {
  profile: ProfileResponse;
  onCancel: () => void;
  onSaved: () => Promise<void>;
};

type ProfileValueProps = {
  label: string;
  value: string;
};

const formatDate = (value: string | null): string => {
  if (value === null) {
    return "Not provided";
  }

  const date = new Date(
    value.includes("T") ? value : `${value}T00:00:00.000Z`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
};

function ProfileValue({ label, value }: ProfileValueProps) {
  return (
    <div className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-semibold text-foreground sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function ProfileEditForm({
  profile,
  onCancel,
  onSaved,
}: ProfileEditFormProps) {
  const [draft, setDraft] = useState<ProfileEditDraft>(() =>
    createProfileEditDraft(profile),
  );
  const [errors, setErrors] = useState<ProfileEditErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <TField extends keyof ProfileEditDraft>(
    field: TField,
    value: ProfileEditDraft[TField],
  ): void => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setSubmitError(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateProfileEdit(draft);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCurrentProfile(createProfileUpdateRequest(draft));
      await onSaved();
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <div className="flex items-start gap-3 rounded-control bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
        <LockKeyhole
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-safety"
          strokeWidth={2}
        />
        <p>
          Name and birth date stay read-only here. The fields below are the
          settings supported by the current profile contract.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Height"
          name="heightCm"
          type="number"
          inputMode="decimal"
          min={100}
          max={250}
          step={0.1}
          value={draft.heightCm}
          error={errors.heightCm}
          hint="Centimetres"
          disabled={isSubmitting}
          onChange={(event) => updateField("heightCm", event.target.value)}
        />

        <Input
          label="Time zone"
          name="timezone"
          value={draft.timezone}
          error={errors.timezone}
          disabled={isSubmitting}
          onChange={(event) => updateField("timezone", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Primary goal"
          name="primaryGoal"
          value={draft.primaryGoal}
          options={profileGoalOptions}
          disabled={isSubmitting}
          onChange={(event) =>
            updateField(
              "primaryGoal",
              event.target.value as ProfileEditDraft["primaryGoal"],
            )
          }
        />

        <Input
          label="Target weight"
          name="targetWeightKg"
          type="number"
          inputMode="decimal"
          min={30}
          max={500}
          step={0.01}
          value={draft.targetWeightKg}
          error={errors.targetWeightKg}
          hint="Optional, in kilograms"
          disabled={isSubmitting}
          onChange={(event) =>
            updateField("targetWeightKg", event.target.value)
          }
        />
      </div>

      {submitError !== null ? (
        <ErrorState title="Profile update failed" description={submitError} />
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Saving changes..."
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

export function ProfileDetails() {
  const { profile, error, isLoading, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showSavedState, setShowSavedState] = useState(false);

  if (isLoading) {
    return <Skeleton label="Loading profile details" lines={5} />;
  }

  if (error !== null) {
    return (
      <ErrorState
        title="Unable to load your profile"
        description={error.message}
        onRetry={() => void refreshProfile()}
      />
    );
  }

  if (profile === null) {
    return (
      <EmptyState
        title="Profile details are unavailable"
        description="Your profile could not be displayed in this workspace."
      />
    );
  }

  const handleSaved = async (): Promise<void> => {
    await refreshProfile();
    setIsEditing(false);
    setShowSavedState(true);
  };

  return (
    <div className="space-y-4">
      {showSavedState ? (
        <SuccessState
          title="Profile updated"
          description="Your goal and profile settings are up to date."
        />
      ) : null}

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
              Personal context
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Profile details
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Review your identity details and adjust the settings that guide
              your current goal.
            </p>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditing(true);
                setShowSavedState(false);
              }}
            >
              <Pencil aria-hidden="true" className="size-4" strokeWidth={2} />
              Edit profile
            </Button>
          ) : null}
        </div>

        <div className="pt-6">
          {isEditing ? (
            <ProfileEditForm
              key={profile.updatedAt}
              profile={profile}
              onCancel={() => setIsEditing(false)}
              onSaved={handleSaved}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <section
                aria-labelledby="profile-identity-title"
                className="rounded-card border border-border bg-surface-muted p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-control bg-surface text-primary"
                  >
                    <UserRound className="size-5" strokeWidth={2} />
                  </span>
                  <h3 id="profile-identity-title" className="text-lg font-semibold">
                    Identity
                  </h3>
                </div>

                <dl className="mt-5 divide-y divide-border">
                  <ProfileValue
                    label="Full name"
                    value={`${profile.firstName} ${profile.lastName}`}
                  />
                  <ProfileValue label="Display name" value={profile.userName} />
                  <ProfileValue
                    label="Date of birth"
                    value={formatDate(profile.dateOfBirth)}
                  />
                </dl>
              </section>

              <section
                aria-labelledby="profile-goal-title"
                className="rounded-card border border-border bg-surface-muted p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-control bg-surface text-primary"
                  >
                    <Target className="size-5" strokeWidth={2} />
                  </span>
                  <h3 id="profile-goal-title" className="text-lg font-semibold">
                    Goal and settings
                  </h3>
                </div>

                <dl className="mt-5 divide-y divide-border">
                  <ProfileValue
                    label="Primary goal"
                    value={getProfileGoalLabel(profile.primaryGoal)}
                  />
                  <ProfileValue label="Height" value={`${profile.heightCm} cm`} />
                  <ProfileValue label="Time zone" value={profile.timezone} />
                  <ProfileValue
                    label="Target weight"
                    value={
                      profile.targetWeightKg === null
                        ? "Not set"
                        : `${profile.targetWeightKg} kg`
                    }
                  />
                  <ProfileValue
                    label="Last doctor visit"
                    value={formatDate(profile.lastDoctorVisitAt)}
                  />
                </dl>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
