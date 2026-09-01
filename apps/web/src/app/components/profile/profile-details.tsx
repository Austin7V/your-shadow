"use client";

import {
    useState,
    type FormEvent,
} from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import {
    updateCurrentProfile,
} from "@/lib/api/profile-api";
import type {
    ProfileResponse,
} from "@/lib/contracts";
import {
    profileGoalOptions,
} from "@/lib/onboarding/personal-data";
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

const formatDate = (
    value: string | null,
): string => {
    if (value === null) {
        return "Not provided";
    }

    const date = new Date(
        value.includes("T")
            ? value
            : `${value}T00:00:00.000Z`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "UTC",
    }).format(date);
};

function ProfileValue({
                          label,
                          value,
                      }: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <dt className="text-sm font-medium text-muted-foreground">
                {label}
            </dt>

            <dd className="mt-1 font-semibold">{value}</dd>
        </div>
    );
}

function ProfileEditForm({
                             profile,
                             onCancel,
                             onSaved,
                         }: ProfileEditFormProps) {
    const [draft, setDraft] = useState<ProfileEditDraft>(
        () => createProfileEditDraft(profile),
    );
    const [errors, setErrors] =
        useState<ProfileEditErrors>({});
    const [submitError, setSubmitError] = useState<
        string | null
    >(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const updateField = <
        TField extends keyof ProfileEditDraft,
    >(
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

        const validationErrors =
            validateProfileEdit(draft);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await updateCurrentProfile(
                createProfileUpdateRequest(draft),
            );

            await onSaved();
        } catch (error: unknown) {
            setSubmitError(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-5"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
        >
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
                    hint="Height in centimetres."
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateField("heightCm", event.target.value)
                    }
                />

                <Input
                    label="Time zone"
                    name="timezone"
                    value={draft.timezone}
                    error={errors.timezone}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateField("timezone", event.target.value)
                    }
                />
            </div>

            <Select
                label="Primary goal"
                name="primaryGoal"
                value={draft.primaryGoal}
                options={profileGoalOptions}
                disabled={isSubmitting}
                onChange={(event) =>
                    updateField(
                        "primaryGoal",
                        event.target
                            .value as ProfileEditDraft["primaryGoal"],
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
                hint="Optional. Weight in kilograms."
                disabled={isSubmitting}
                onChange={(event) =>
                    updateField(
                        "targetWeightKg",
                        event.target.value,
                    )
                }
            />

            {submitError !== null ? (
                <p
                    className="rounded-md border border-error bg-error/10 p-4 text-sm text-error"
                    role="alert"
                >
                    {submitError}
                </p>
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
                >
                    Save changes
                </Button>
            </div>
        </form>
    );
}

export function ProfileDetails() {
    const {
        profile,
        error,
        isLoading,
        refreshProfile,
    } = useProfile();
    const [isEditing, setIsEditing] = useState(false);

    if (isLoading) {
        return (
            <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                    Loading profile...
                </p>
            </section>
        );
    }

    if (error !== null) {
        return (
            <section className="rounded-lg border border-error bg-surface p-6 shadow-sm">
                <p className="text-error">{error.message}</p>

                <Button
                    type="button"
                    className="mt-4"
                    onClick={() => void refreshProfile()}
                >
                    Try again
                </Button>
            </section>
        );
    }

    if (profile === null) {
        return null;
    }

    const handleSaved = async (): Promise<void> => {
        await refreshProfile();
        setIsEditing(false);
    };

    return (
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Personal profile
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Your personal goals and basic information.
                    </p>
                </div>

                {!isEditing ? (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                    >
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
                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <ProfileValue
                            label="Full name"
                            value={`${profile.firstName} ${profile.lastName}`}
                        />

                        <ProfileValue
                            label="Display name"
                            value={profile.userName}
                        />

                        <ProfileValue
                            label="Date of birth"
                            value={formatDate(profile.dateOfBirth)}
                        />

                        <ProfileValue
                            label="Height"
                            value={`${profile.heightCm} cm`}
                        />

                        <ProfileValue
                            label="Time zone"
                            value={profile.timezone}
                        />

                        <ProfileValue
                            label="Primary goal"
                            value={getProfileGoalLabel(
                                profile.primaryGoal,
                            )}
                        />

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
                            value={formatDate(
                                profile.lastDoctorVisitAt,
                            )}
                        />
                    </dl>
                )}
            </div>
        </section>
    );
}