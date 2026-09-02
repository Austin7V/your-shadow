"use client";

import { Pencil, Plus, Power, ShieldAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SuccessState } from "@/app/components/ui/success-state";
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

const getTypeLabel = (value: string): string => {
  return (
    healthConstraintTypeOptions.find((option) => option.value === value)
      ?.label ?? value
  );
};

const getSeverityLabel = (value: string): string => {
  return (
    healthConstraintSeverityOptions.find((option) => option.value === value)
      ?.label ?? value
  );
};

function ConstraintForm({
  constraint,
  onCancel,
  onSaved,
}: ConstraintFormProps) {
  const [draft, setDraft] = useState<HealthConstraintDraft>(() => {
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

  const [errors, setErrors] = useState<HealthConstraintErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <TField extends EditableConstraintField>(
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

    const constraintErrors = validationErrors.constraints?.[0];

    if (
      constraintErrors !== undefined &&
      Object.keys(constraintErrors).length > 0
    ) {
      setErrors(constraintErrors);
      return;
    }

    if (draft.type === "" || draft.severity === "") {
      return;
    }

    const request: CreateHealthConstraintRequest = {
      type: draft.type,
      title: draft.title.trim(),
      notes: draft.notes.trim() === "" ? null : draft.notes.trim(),
      severity: draft.severity,
    };

    setIsSubmitting(true);

    try {
      if (constraint === undefined) {
        await createHealthConstraint(request);
      } else {
        await updateHealthConstraint(constraint.id, request);
      }

      await onSaved();
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNewConstraint = constraint === undefined;

  return (
    <form
      className="space-y-5 rounded-card border border-border bg-surface-muted p-5 sm:p-6"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <div>
        <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
          {isNewConstraint ? "New health context" : "Edit health context"}
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          {isNewConstraint ? "Add a constraint" : constraint.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Include only details that may affect your everyday wellness guidance.
        </p>
      </div>

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
              event.target.value as HealthConstraintDraft["type"],
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
              event.target.value as HealthConstraintDraft["severity"],
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
        onChange={(event) => updateField("title", event.target.value)}
      />

      <Textarea
        label="Notes"
        name="constraintNotes"
        maxLength={1000}
        rows={4}
        value={draft.notes}
        error={errors.notes}
        hint="Optional. Keep this focused on information relevant to your daily plan."
        disabled={isSubmitting}
        onChange={(event) => updateField("notes", event.target.value)}
      />

      {submitError !== null ? (
        <ErrorState
          title="Constraint was not saved"
          description={submitError}
        />
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
          loadingLabel={isNewConstraint ? "Adding constraint..." : "Saving changes..."}
        >
          {isNewConstraint ? "Add constraint" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function HealthConstraints() {
  const { healthConstraints, error, isLoading, refreshHealthConstraints } =
    useHealthConstraints();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaved = async (): Promise<void> => {
    await refreshHealthConstraints();
    setIsAdding(false);
    setEditingId(null);
    setSuccessMessage("Your health constraint has been saved.");
  };

  const changeActiveState = async (
    constraintId: string,
    isActive: boolean,
  ): Promise<void> => {
    setUpdatingId(constraintId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await updateHealthConstraint(constraintId, {
        isActive,
      });

      await refreshHealthConstraints();
      setSuccessMessage(
        isActive
          ? "The health constraint is active."
          : "The health constraint is inactive.",
      );
    } catch (requestError: unknown) {
      setActionError(getAuthErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <Skeleton label="Loading health constraints" lines={5} />;
  }

  if (error !== null) {
    return (
      <ErrorState
        title="Unable to load health constraints"
        description={error.message}
        onRetry={() => void refreshHealthConstraints()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {successMessage !== null ? (
        <SuccessState
          title="Health context updated"
          description={successMessage}
        />
      ) : null}

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-safety uppercase">
              Private health context
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Health constraints
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Keep only the information that may affect your daily wellness
              guidance, and deactivate anything that no longer applies.
            </p>
          </div>

          {!isAdding ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setActionError(null);
                setSuccessMessage(null);
              }}
            >
              <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
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
            <ErrorState
              title="Health context was not updated"
              description={actionError}
            />
          ) : null}

          {healthConstraints.length === 0 && !isAdding ? (
            <EmptyState
              title="No health constraints added"
              description="You can leave this section empty or add context when it becomes relevant."
            />
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
                className="rounded-card border border-border bg-surface-raised p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-9 items-center justify-center rounded-control bg-safety/10 text-safety"
                      >
                        <ShieldAlert className="size-4" strokeWidth={2} />
                      </span>
                      <h3 className="min-w-0 break-words text-lg font-semibold">
                        {constraint.title}
                      </h3>
                      <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {getSeverityLabel(constraint.severity)} severity
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          constraint.isActive
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-surface-muted text-muted-foreground"
                        }`}
                      >
                        {constraint.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      {getTypeLabel(constraint.type)}
                    </p>

                    {constraint.notes !== null ? (
                      <p className="mt-4 max-w-3xl whitespace-pre-wrap break-words rounded-control bg-surface-muted p-4 text-base leading-7 text-foreground">
                        {constraint.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setEditingId(constraint.id);
                        setIsAdding(false);
                        setActionError(null);
                        setSuccessMessage(null);
                      }}
                    >
                      <Pencil
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2}
                      />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      loading={updatingId === constraint.id}
                      loadingLabel={
                        constraint.isActive ? "Deactivating..." : "Activating..."
                      }
                      onClick={() =>
                        void changeActiveState(
                          constraint.id,
                          !constraint.isActive,
                        )
                      }
                    >
                      <Power
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2}
                      />
                      {constraint.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
