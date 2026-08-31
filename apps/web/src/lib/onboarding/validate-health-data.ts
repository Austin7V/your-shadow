import {
    HEALTH_CONSTRAINT_SEVERITIES,
    HEALTH_CONSTRAINT_TYPES,
} from "@/lib/contracts";
import type {
    HealthConstraintDraft,
    HealthDataDraft,
} from "@/lib/onboarding/health-data";

export type HealthConstraintErrors = Partial<
    Record<
        Exclude<keyof HealthConstraintDraft, "clientId">,
        string
    >
>;

export type HealthDataErrors = {
    lastDoctorVisitAt?: string;
    constraints?: HealthConstraintErrors[];
    isAdultConfirmed?: string;
    healthDataConsent?: string;
    aiProcessingConsent?: string;
};

const parseDate = (value: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (match === null) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
};

const validateConstraint = (
    constraint: HealthConstraintDraft,
): HealthConstraintErrors => {
    const errors: HealthConstraintErrors = {};
    const title = constraint.title.trim();
    const notes = constraint.notes.trim();

    if (
        constraint.type === "" ||
        !(HEALTH_CONSTRAINT_TYPES as readonly string[]).includes(
            constraint.type,
        )
    ) {
        errors.type = "Choose a constraint type.";
    }

    if (title.length < 1 || title.length > 100) {
        errors.title =
            "Enter a title of up to 100 characters.";
    }

    if (notes.length > 1000) {
        errors.notes =
            "Notes cannot be longer than 1000 characters.";
    }

    if (
        constraint.severity === "" ||
        !(
            HEALTH_CONSTRAINT_SEVERITIES as readonly string[]
        ).includes(constraint.severity)
    ) {
        errors.severity = "Choose a severity level.";
    }

    return errors;
};

export const validateHealthData = (
    draft: HealthDataDraft,
): HealthDataErrors => {
    const errors: HealthDataErrors = {};

    if (draft.lastDoctorVisitAt !== "") {
        const doctorVisitDate = parseDate(
            draft.lastDoctorVisitAt,
        );

        if (doctorVisitDate === null) {
            errors.lastDoctorVisitAt =
                "Enter a valid date.";
        } else if (doctorVisitDate > new Date()) {
            errors.lastDoctorVisitAt =
                "The doctor visit cannot be in the future.";
        }
    }

    const constraintErrors = draft.constraints.map(
        validateConstraint,
    );

    if (
        constraintErrors.some(
            (constraintError) =>
                Object.keys(constraintError).length > 0,
        )
    ) {
        errors.constraints = constraintErrors;
    }

    if (!draft.isAdultConfirmed) {
        errors.isAdultConfirmed =
            "Confirm that you are at least 18 years old.";
    }

    if (!draft.healthDataConsent) {
        errors.healthDataConsent =
            "Consent to process health data is required.";
    }

    if (!draft.aiProcessingConsent) {
        errors.aiProcessingConsent =
            "Consent to AI-assisted processing is required.";
    }

    return errors;
};

export const normalizeHealthData = (
    draft: HealthDataDraft,
): HealthDataDraft => ({
    ...draft,
    lastDoctorVisitAt: draft.lastDoctorVisitAt.trim(),
    constraints: draft.constraints.map((constraint) => ({
        ...constraint,
        title: constraint.title.trim(),
        notes: constraint.notes.trim(),
    })),
});