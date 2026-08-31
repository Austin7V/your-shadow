"use client";

import {
    useState,
    type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { FormSection } from "@/app/components/ui/form-section";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import {
    createHealthConstraint,
    createProfile,
    createWeightEntry,
} from "@/lib/api/profile-api";
import type {
    CreateHealthConstraintRequest,
    CreateProfileRequest,
} from "@/lib/contracts";
import {
    clearOnboardingDrafts,
    createEmptyHealthConstraintDraft,
    createEmptyHealthDataDraft,
    healthConstraintSeverityOptions,
    healthConstraintTypeOptions,
    loadHealthDataDraft,
    saveHealthDataDraft,
    type HealthConstraintDraft,
    type HealthDataDraft,
} from "@/lib/onboarding/health-data";
import {
    loadPersonalDataDraft,
} from "@/lib/onboarding/personal-data";
import {
    normalizeHealthData,
    validateHealthData,
    type HealthDataErrors,
} from "@/lib/onboarding/validate-health-data";
import {
    normalizePersonalData,
    validatePersonalData,
} from "@/lib/onboarding/validate-personal-data";

type EditableConstraintField = Exclude<
    keyof HealthConstraintDraft,
    "clientId"
>;

export function HealthDataForm() {
    const router = useRouter();

    const [draft, setDraft] = useState<HealthDataDraft>(
        () => {
            if (typeof window === "undefined") {
                return createEmptyHealthDataDraft();
            }

            return loadHealthDataDraft();
        },
    );

    const [errors, setErrors] =
        useState<HealthDataErrors>({});
    const [submitError, setSubmitError] = useState<
        string | null
    >(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const updateDraft = <
        TField extends keyof HealthDataDraft,
    >(
        field: TField,
        value: HealthDataDraft[TField],
    ): void => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            [field]: value,
        }));

        setErrors({});
        setSubmitError(null);
    };

    const updateConstraint = <
        TField extends EditableConstraintField,
    >(
        index: number,
        field: TField,
        value: HealthConstraintDraft[TField],
    ): void => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            constraints: currentDraft.constraints.map(
                (constraint, constraintIndex) =>
                    constraintIndex === index
                        ? {
                            ...constraint,
                            [field]: value,
                        }
                        : constraint,
            ),
        }));

        setErrors({});
        setSubmitError(null);
    };

    const addConstraint = (): void => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            constraints: [
                ...currentDraft.constraints,
                createEmptyHealthConstraintDraft(),
            ],
        }));
    };

    const removeConstraint = (
        clientId: string,
    ): void => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            constraints: currentDraft.constraints.filter(
                (constraint) =>
                    constraint.clientId !== clientId,
            ),
        }));

        setErrors({});
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        setSubmitError(null);

        const healthValidationErrors =
            validateHealthData(draft);

        if (
            Object.keys(healthValidationErrors).length > 0
        ) {
            setErrors(healthValidationErrors);
            return;
        }

        const personalDraft = loadPersonalDataDraft();
        const personalValidationErrors =
            validatePersonalData(personalDraft);

        if (
            Object.keys(personalValidationErrors).length > 0
        ) {
            router.replace("/onboarding");
            return;
        }

        const personalData =
            normalizePersonalData(personalDraft);
        const healthData = normalizeHealthData(draft);
        const primaryGoal = personalData.primaryGoal;

        if (primaryGoal === "") {
            router.replace("/onboarding");
            return;
        }

        const profileRequest: CreateProfileRequest = {
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            userName: personalData.userName,
            dateOfBirth: personalData.dateOfBirth,
            heightCm: Number(personalData.heightCm),
            timezone: personalData.timezone,
            primaryGoal,
            targetWeightKg:
                personalData.targetWeightKg === ""
                    ? null
                    : Number(personalData.targetWeightKg),
            lastDoctorVisitAt:
                healthData.lastDoctorVisitAt === ""
                    ? null
                    : healthData.lastDoctorVisitAt,
        };

        const constraintRequests: CreateHealthConstraintRequest[] =
            healthData.constraints.map((constraint) => {
                if (
                    constraint.type === "" ||
                    constraint.severity === ""
                ) {
                    throw new Error(
                        "Invalid health constraint data.",
                    );
                }

                return {
                    type: constraint.type,
                    title: constraint.title,
                    notes:
                        constraint.notes === ""
                            ? null
                            : constraint.notes,
                    severity: constraint.severity,
                };
            });

        saveHealthDataDraft(healthData);
        setIsSubmitting(true);

        try {
            await createWeightEntry({
                weightKg: Number(
                    personalData.currentWeightKg,
                ),
            });

            for (const constraintRequest of constraintRequests) {
                await createHealthConstraint(constraintRequest);
            }

            await createProfile(profileRequest);

            await mutate(
                "/api/profile/status",
                true,
                {
                    revalidate: false,
                },
            );

            clearOnboardingDrafts();
            router.replace("/dashboard");
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
            <FormSection
                title="Health information"
                description="Add only information that may affect your movement, nutrition or daily recommendations."
            >
                <Input
                    label="Last doctor visit"
                    name="lastDoctorVisitAt"
                    type="date"
                    value={draft.lastDoctorVisitAt}
                    error={errors.lastDoctorVisitAt}
                    hint="Optional."
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateDraft(
                            "lastDoctorVisitAt",
                            event.target.value,
                        )
                    }
                />
            </FormSection>

            <FormSection
                title="Health constraints"
                description="You can skip this section if you do not have any relevant constraints."
            >
                {draft.constraints.length === 0 ? (
                    <p className="rounded-md border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                        No health constraints added.
                    </p>
                ) : null}

                {draft.constraints.map((constraint, index) => {
                    const constraintErrors =
                        errors.constraints?.[index];

                    return (
                        <div
                            key={constraint.clientId}
                            className="space-y-5 rounded-lg border border-border p-5"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="font-semibold">
                                    Constraint {index + 1}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeConstraint(
                                            constraint.clientId,
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="text-sm font-semibold text-error hover:underline disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Select
                                    label="Type"
                                    name={`constraint-${index}-type`}
                                    value={constraint.type}
                                    options={healthConstraintTypeOptions}
                                    error={constraintErrors?.type}
                                    disabled={isSubmitting}
                                    onChange={(event) =>
                                        updateConstraint(
                                            index,
                                            "type",
                                            event.target
                                                .value as HealthConstraintDraft["type"],
                                        )
                                    }
                                />

                                <Select
                                    label="Severity"
                                    name={`constraint-${index}-severity`}
                                    value={constraint.severity}
                                    options={
                                        healthConstraintSeverityOptions
                                    }
                                    error={constraintErrors?.severity}
                                    disabled={isSubmitting}
                                    onChange={(event) =>
                                        updateConstraint(
                                            index,
                                            "severity",
                                            event.target
                                                .value as HealthConstraintDraft["severity"],
                                        )
                                    }
                                />
                            </div>

                            <Input
                                label="Title"
                                name={`constraint-${index}-title`}
                                maxLength={100}
                                value={constraint.title}
                                error={constraintErrors?.title}
                                hint="For example: Lower back pain."
                                disabled={isSubmitting}
                                onChange={(event) =>
                                    updateConstraint(
                                        index,
                                        "title",
                                        event.target.value,
                                    )
                                }
                            />

                            <Textarea
                                label="Notes"
                                name={`constraint-${index}-notes`}
                                maxLength={1000}
                                rows={4}
                                value={constraint.notes}
                                error={constraintErrors?.notes}
                                hint="Optional. Add details that may affect your daily plan."
                                disabled={isSubmitting}
                                onChange={(event) =>
                                    updateConstraint(
                                        index,
                                        "notes",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    );
                })}

                <Button
                    type="button"
                    variant="secondary"
                    onClick={addConstraint}
                    disabled={isSubmitting}
                >
                    Add health constraint
                </Button>
            </FormSection>

            <FormSection
                title="Confirmations and consent"
                description="These confirmations are required to complete your profile."
            >
                <Checkbox
                    label="I confirm that I am at least 18 years old."
                    checked={draft.isAdultConfirmed}
                    error={errors.isAdultConfirmed}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateDraft(
                            "isAdultConfirmed",
                            event.target.checked,
                        )
                    }
                />

                <Checkbox
                    label="I consent to the processing of the health information I provide."
                    checked={draft.healthDataConsent}
                    error={errors.healthDataConsent}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateDraft(
                            "healthDataConsent",
                            event.target.checked,
                        )
                    }
                />

                <Checkbox
                    label="I consent to AI-assisted processing for personalised wellness guidance."
                    checked={draft.aiProcessingConsent}
                    error={errors.aiProcessingConsent}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateDraft(
                            "aiProcessingConsent",
                            event.target.checked,
                        )
                    }
                />

                <aside className="rounded-md border border-safety bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
                    Your Shadow supports everyday wellness and
                    healthy habits. It does not diagnose medical
                    conditions, provide treatment or replace a
                    qualified healthcare professional. In an
                    emergency, contact your local emergency services.
                </aside>
            </FormSection>

            {submitError !== null ? (
                <p
                    className="rounded-md border border-error bg-error/10 p-4 text-sm text-error"
                    role="alert"
                >
                    {submitError}
                </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Link
                    href="/onboarding"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted"
                >
                    Back
                </Link>

                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="sm:min-w-48"
                >
                    Complete onboarding
                </Button>
            </div>
        </form>
    );
}