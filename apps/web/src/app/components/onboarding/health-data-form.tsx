"use client";

import Link from "next/link";
import { ArrowLeft, Check, ListPlus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { mutate } from "swr";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ErrorState } from "@/app/components/ui/error-state";
import { FormSection } from "@/app/components/ui/form-section";
import { IconButton } from "@/app/components/ui/icon-button";
import { Input } from "@/app/components/ui/input";
import { SafetyState } from "@/app/components/ui/safety-state";
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
import { loadPersonalDataDraft } from "@/lib/onboarding/personal-data";
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

  const [draft, setDraft] = useState<HealthDataDraft>(() => {
    if (typeof window === "undefined") {
      return createEmptyHealthDataDraft();
    }

    return loadHealthDataDraft();
  });

  const [errors, setErrors] = useState<HealthDataErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDraft = <TField extends keyof HealthDataDraft>(
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

  const updateConstraint = <TField extends EditableConstraintField>(
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

  const removeConstraint = (clientId: string): void => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      constraints: currentDraft.constraints.filter(
        (constraint) => constraint.clientId !== clientId,
      ),
    }));

    setErrors({});
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);

    const healthValidationErrors = validateHealthData(draft);

    if (Object.keys(healthValidationErrors).length > 0) {
      setErrors(healthValidationErrors);
      return;
    }

    const personalDraft = loadPersonalDataDraft();
    const personalValidationErrors = validatePersonalData(personalDraft);

    if (Object.keys(personalValidationErrors).length > 0) {
      router.replace("/onboarding");
      return;
    }

    const personalData = normalizePersonalData(personalDraft);
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
        if (constraint.type === "" || constraint.severity === "") {
          throw new Error("Invalid health constraint data.");
        }

        return {
          type: constraint.type,
          title: constraint.title,
          notes: constraint.notes === "" ? null : constraint.notes,
          severity: constraint.severity,
        };
      });

    saveHealthDataDraft(healthData);
    setIsSubmitting(true);

    try {
      await createWeightEntry({
        weightKg: Number(personalData.currentWeightKg),
      });

      for (const constraintRequest of constraintRequests) {
        await createHealthConstraint(constraintRequest);
      }

      await createProfile(profileRequest);

      await mutate("/api/profile/status", true, {
        revalidate: false,
      });

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
      <SafetyState
        title="Your safety comes first"
        description="Your Shadow supports everyday wellness and healthy habits. It does not diagnose medical conditions, provide treatment, or replace a qualified healthcare professional. In an emergency, contact your local emergency services."
      />

      <FormSection
        title="Health context"
        description="This optional date can provide useful context when you review your profile later."
      >
        <div className="max-w-md">
          <Input
            label="Last doctor visit"
            name="lastDoctorVisitAt"
            type="date"
            value={draft.lastDoctorVisitAt}
            error={errors.lastDoctorVisitAt}
            hint="Optional. Leave this blank if you prefer not to add it."
            disabled={isSubmitting}
            onChange={(event) =>
              updateDraft("lastDoctorVisitAt", event.target.value)
            }
          />
        </div>
      </FormSection>

      <FormSection
        title="Health constraints"
        description="Add only constraints that may affect movement, nutrition, or everyday guidance. You can leave this section empty."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={addConstraint}
            disabled={isSubmitting}
          >
            <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
            Add constraint
          </Button>
        }
      >
        {draft.constraints.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-surface-muted p-6 text-center">
            <span className="mx-auto inline-flex size-11 items-center justify-center rounded-control bg-surface text-primary-content">
              <ListPlus aria-hidden="true" className="size-5" strokeWidth={2} />
            </span>
            <p className="mt-4 font-semibold text-foreground">
              No health constraints added
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              That is completely fine. Add one only when it is relevant to your
              wellness guidance.
            </p>
          </div>
        ) : null}

        {draft.constraints.map((constraint, index) => {
          const constraintErrors = errors.constraints?.[index];
          const titleId = `constraint-${constraint.clientId}-title`;

          return (
            <section
              key={constraint.clientId}
              aria-labelledby={titleId}
              className="rounded-card border border-border bg-surface-raised p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-primary-content uppercase">
                    Health context
                  </p>
                  <h3 id={titleId} className="mt-1 text-lg font-semibold">
                    Constraint {index + 1}
                  </h3>
                </div>

                <IconButton
                  label={`Remove constraint ${index + 1}`}
                  variant="danger"
                  onClick={() => removeConstraint(constraint.clientId)}
                  disabled={isSubmitting}
                >
                  <Trash2 aria-hidden="true" className="size-5" strokeWidth={2} />
                </IconButton>
              </div>

              <div className="mt-6 space-y-5">
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
                        event.target.value as HealthConstraintDraft["type"],
                      )
                    }
                  />

                  <Select
                    label="Severity"
                    name={`constraint-${index}-severity`}
                    value={constraint.severity}
                    options={healthConstraintSeverityOptions}
                    error={constraintErrors?.severity}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateConstraint(
                        index,
                        "severity",
                        event.target.value as HealthConstraintDraft["severity"],
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
                    updateConstraint(index, "title", event.target.value)
                  }
                />

                <Textarea
                  label="Notes"
                  name={`constraint-${index}-notes`}
                  maxLength={1000}
                  rows={4}
                  value={constraint.notes}
                  error={constraintErrors?.notes}
                  hint="Optional. Add only details that may affect your daily plan."
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateConstraint(index, "notes", event.target.value)
                  }
                />
              </div>
            </section>
          );
        })}
      </FormSection>

      <FormSection
        title="Confirmations and consent"
        description="Review each statement carefully. All three confirmations are required and none are selected automatically."
        variant="muted"
        actions={
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
            Required
          </span>
        }
      >
        <div className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-5">
          <Checkbox
            label="I confirm that I am at least 18 years old."
            hint="Required to use Your Shadow."
            checked={draft.isAdultConfirmed}
            error={errors.isAdultConfirmed}
            disabled={isSubmitting}
            onChange={(event) =>
              updateDraft("isAdultConfirmed", event.target.checked)
            }
          />

          <Checkbox
            label="I consent to the processing of the health information I provide."
            hint="This applies to the health context you choose to submit."
            checked={draft.healthDataConsent}
            error={errors.healthDataConsent}
            disabled={isSubmitting}
            onChange={(event) =>
              updateDraft("healthDataConsent", event.target.checked)
            }
          />

          <Checkbox
            label="I consent to AI-assisted processing for personalised wellness guidance."
            hint="This allows Your Shadow to use your submitted context for wellness guidance."
            checked={draft.aiProcessingConsent}
            error={errors.aiProcessingConsent}
            disabled={isSubmitting}
            onChange={(event) =>
              updateDraft("aiProcessingConsent", event.target.checked)
            }
          />
        </div>
      </FormSection>

      {submitError !== null ? (
        <ErrorState
          title="We could not complete setup"
          description={submitError}
        />
      ) : null}

      <div className="flex flex-col-reverse gap-3 rounded-card border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Link
          href="/onboarding"
          className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
          Back
        </Link>

        <Button
          type="submit"
          loading={isSubmitting}
          loadingLabel="Completing setup..."
          className="min-h-12 sm:min-w-52"
        >
          <Check aria-hidden="true" className="size-4" strokeWidth={2} />
          Complete onboarding
        </Button>
      </div>
    </form>
  );
}
