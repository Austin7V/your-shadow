"use client";

import {
    useState,
    type FormEvent,
} from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { useHealthConstraints } from "@/hooks/use-health-constraints";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import {
    createHealthConstraint,
    updateHealthConstraint,
} from "@/lib/api/profile-api";
import type {
    CreateHealthConstraintRequest,
    HealthConstraintResponse,
} from "@/lib/contracts";
import {
    createEmptyHealthConstraintDraft,
    healthConstraintSeverityOptions,
    healthConstraintTypeOptions,
    type HealthConstraintDraft,
} from "@/lib/onboarding/health-data";
import {
    validateHealthData,
    type HealthConstraintErrors,
} from "@/lib/onboarding/validate-health-data";

type ConstraintFormProps = {
    constraint?: HealthConstraintResponse;
    onCancel: () => void;
    onSaved: () => Promise<void>;
};

type EditableConstraintField = Exclude<
    keyof HealthConstraintDraft,
    "clientId"
>;

const getTypeLabel = (
    value: string,
): string => {
    return (
        healthConstraintTypeOptions.find(
            (option) => option.value === value,
        )?.label ?? value
    );
};

const getSeverityLabel = (
    value: string,
): string => {
    return (
        healthConstraintSeverityOptions.find(
            (option) => option.value === value,
        )?.label ?? value
    );
};

function ConstraintForm({
                            constraint,
                            onCancel,
                            onSaved,
                        }: ConstraintFormProps) {
    const [draft, setDraft] =
        useState<HealthConstraintDraft>(() => {
            if (constraint === undefined) {
                return createEmptyHealthConstraintDraft();
            }

            return {
                clientId: constraint.id,
                type: constraint.type,
                title: constraint.title,
                notes: constraint.notes ?? "",
                severity: constraint.severity,
            };
        });

    const [errors, setErrors] =
        useState<HealthConstraintErrors>({});
    const [submitError, setSubmitError] = useState<
        string | null
    >(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const updateField = <
        TField extends EditableConstraintField,
    >(
        field: TField,
        value: HealthConstraintDraft[TField],
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

        const validationErrors = validateHealthData({
            lastDoctorVisitAt: "",
            constraints: [draft],
            isAdultConfirmed: true,
            healthDataConsent: true,
            aiProcessingConsent: true,
        });

        const constraintErrors =
            validationErrors.constraints?.[0];

        if (
            constraintErrors !== undefined &&
            Object.keys(constraintErrors).length > 0
        ) {
            setErrors(constraintErrors);
            return;
        }

        if (
            draft.type === "" ||
            draft.severity === ""
        ) {
            return;
        }

        const request: CreateHealthConstraintRequest = {
            type: draft.type,
            title: draft.title.trim(),
            notes:
                draft.notes.trim() === ""
                    ? null
                    : draft.notes.trim(),
            severity: draft.severity,
        };

        setIsSubmitting(true);

        try {
            if (constraint === undefined) {
                await createHealthConstraint(request);
            } else {
                await updateHealthConstraint(
                    constraint.id,
                    request,
                );
            }

            await onSaved();
        } catch (error: unknown) {
            setSubmitError(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="space-y-5 rounded-lg border border-border bg-surface-muted p-5"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <Select
                    label="Type"
                    name="constraintType"
                    value={draft.type}
                    options={healthConstraintTypeOptions}
                    error={errors.type}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateField(
                            "type",
                            event.target
                                .value as HealthConstraintDraft["type"],
                        )
                    }
                />

                <Select
                    label="Severity"
                    name="constraintSeverity"
                    value={draft.severity}
                    options={healthConstraintSeverityOptions}
                    error={errors.severity}
                    disabled={isSubmitting}
                    onChange={(event) =>
                        updateField(
                            "severity",
                            event.target
                                .value as HealthConstraintDraft["severity"],
                        )
                    }
                />
            </div>

            <Input
                label="Title"
                name="constraintTitle"
                maxLength={100}
                value={draft.title}
                error={errors.title}
                disabled={isSubmitting}
                onChange={(event) =>
                    updateField("title", event.target.value)
                }
            />

            <Textarea
                label="Notes"
                name="constraintNotes"
                maxLength={1000}
                rows={4}
                value={draft.notes}
                error={errors.notes}
                hint="Optional."
                disabled={isSubmitting}
                onChange={(event) =>
                    updateField("notes", event.target.value)
                }
            />

            {submitError !== null ? (
                <p
                    className="text-sm text-error"
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
                    {constraint === undefined
                        ? "Add constraint"
                        : "Save changes"}
                </Button>
            </div>
        </form>
    );
}

export function HealthConstraints() {
    const {
        healthConstraints,
        error,
        isLoading,
        refreshHealthConstraints,
    } = useHealthConstraints();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<
        string | null
    >(null);
    const [updatingId, setUpdatingId] = useState<
        string | null
    >(null);
    const [actionError, setActionError] = useState<
        string | null
    >(null);

    const handleSaved = async (): Promise<void> => {
        await refreshHealthConstraints();
        setIsAdding(false);
        setEditingId(null);
    };

    const changeActiveState = async (
        constraintId: string,
        isActive: boolean,
    ): Promise<void> => {
        setUpdatingId(constraintId);
        setActionError(null);

        try {
            await updateHealthConstraint(
                constraintId,
                {
                    isActive,
                },
            );

            await refreshHealthConstraints();
        } catch (requestError: unknown) {
            setActionError(
                getAuthErrorMessage(requestError),
            );
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                    Loading health constraints...
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
                    onClick={() =>
                        void refreshHealthConstraints()
                    }
                >
                    Try again
                </Button>
            </section>
        );
    }

    return (
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Health constraints
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Keep information that may affect your daily
                        recommendations up to date.
                    </p>
                </div>

                {!isAdding ? (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setIsAdding(true);
                            setEditingId(null);
                        }}
                    >
                        Add constraint
                    </Button>
                ) : null}
            </div>

            <div className="space-y-4 pt-6">
                {isAdding ? (
                    <ConstraintForm
                        onCancel={() => setIsAdding(false)}
                        onSaved={handleSaved}
                    />
                ) : null}

                {actionError !== null ? (
                    <p
                        className="rounded-md border border-error bg-error/10 p-4 text-sm text-error"
                        role="alert"
                    >
                        {actionError}
                    </p>
                ) : null}

                {healthConstraints.length === 0 &&
                !isAdding ? (
                    <p className="rounded-md border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                        No health constraints have been added.
                    </p>
                ) : null}

                {healthConstraints.map((constraint) =>
                    editingId === constraint.id ? (
                        <ConstraintForm
                            key={`${constraint.id}-${constraint.updatedAt}`}
                            constraint={constraint}
                            onCancel={() => setEditingId(null)}
                            onSaved={handleSaved}
                        />
                    ) : (
                        <article
                            key={constraint.id}
                            className="rounded-lg border border-border p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">
                                            {constraint.title}
                                        </h3>

                                        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold">
                      {getSeverityLabel(
                          constraint.severity,
                      )}
                    </span>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                constraint.isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-surface-muted text-muted-foreground"
                                            }`}
                                        >
                      {constraint.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>
                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {getTypeLabel(constraint.type)}
                                    </p>

                                    {constraint.notes !== null ? (
                                        <p className="mt-3 leading-7">
                                            {constraint.notes}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingId(constraint.id);
                                            setIsAdding(false);
                                        }}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        loading={
                                            updatingId === constraint.id
                                        }
                                        onClick={() =>
                                            void changeActiveState(
                                                constraint.id,
                                                !constraint.isActive,
                                            )
                                        }
                                    >
                                        {constraint.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ),
                )}
            </div>
        </section>
    );
}