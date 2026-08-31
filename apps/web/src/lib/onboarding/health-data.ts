import {
    HEALTH_CONSTRAINT_SEVERITIES,
    HEALTH_CONSTRAINT_TYPES,
    type HealthConstraintSeverity,
    type HealthConstraintType,
} from "@/lib/contracts";

export const HEALTH_DATA_STORAGE_KEY =
    "your-shadow:onboarding-health-data";

export type HealthConstraintDraft = {
    clientId: string;
    type: HealthConstraintType | "";
    title: string;
    notes: string;
    severity: HealthConstraintSeverity | "";
};

export type HealthDataDraft = {
    lastDoctorVisitAt: string;
    constraints: HealthConstraintDraft[];
    isAdultConfirmed: boolean;
    healthDataConsent: boolean;
    aiProcessingConsent: boolean;
};

export const healthConstraintTypeOptions: Array<{
    value: HealthConstraintType;
    label: string;
}> = [
    {
        value: "chronic_condition",
        label: "Chronic condition",
    },
    {
        value: "injury",
        label: "Injury",
    },
    {
        value: "allergy",
        label: "Allergy",
    },
    {
        value: "mobility_limitation",
        label: "Mobility limitation",
    },
    {
        value: "medical_restriction",
        label: "Medical restriction",
    },
    {
        value: "other",
        label: "Other",
    },
];

export const healthConstraintSeverityOptions: Array<{
    value: HealthConstraintSeverity;
    label: string;
}> = [
    {
        value: "low",
        label: "Low",
    },
    {
        value: "moderate",
        label: "Moderate",
    },
    {
        value: "high",
        label: "High",
    },
];

export const createEmptyHealthConstraintDraft =
    (): HealthConstraintDraft => ({
        clientId: crypto.randomUUID(),
        type: "",
        title: "",
        notes: "",
        severity: "",
    });

export const createEmptyHealthDataDraft =
    (): HealthDataDraft => ({
        lastDoctorVisitAt: "",
        constraints: [],
        isAdultConfirmed: false,
        healthDataConsent: false,
        aiProcessingConsent: false,
    });

const isHealthConstraintDraft = (
    value: unknown,
): value is HealthConstraintDraft => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const constraint = value as Record<string, unknown>;

    const hasValidType =
        constraint.type === "" ||
        (typeof constraint.type === "string" &&
            (HEALTH_CONSTRAINT_TYPES as readonly string[]).includes(
                constraint.type,
            ));

    const hasValidSeverity =
        constraint.severity === "" ||
        (typeof constraint.severity === "string" &&
            (
                HEALTH_CONSTRAINT_SEVERITIES as readonly string[]
            ).includes(constraint.severity));

    return (
        typeof constraint.clientId === "string" &&
        hasValidType &&
        typeof constraint.title === "string" &&
        typeof constraint.notes === "string" &&
        hasValidSeverity
    );
};

const isHealthDataDraft = (
    value: unknown,
): value is HealthDataDraft => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const draft = value as Record<string, unknown>;

    return (
        typeof draft.lastDoctorVisitAt === "string" &&
        Array.isArray(draft.constraints) &&
        draft.constraints.every(isHealthConstraintDraft) &&
        typeof draft.isAdultConfirmed === "boolean" &&
        typeof draft.healthDataConsent === "boolean" &&
        typeof draft.aiProcessingConsent === "boolean"
    );
};

export const loadHealthDataDraft = (): HealthDataDraft => {
    const storedValue = sessionStorage.getItem(
        HEALTH_DATA_STORAGE_KEY,
    );

    if (storedValue === null) {
        return createEmptyHealthDataDraft();
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (isHealthDataDraft(parsedValue)) {
            return parsedValue;
        }
    } catch {
        return createEmptyHealthDataDraft();
    }

    return createEmptyHealthDataDraft();
};

export const saveHealthDataDraft = (
    draft: HealthDataDraft,
): void => {
    sessionStorage.setItem(
        HEALTH_DATA_STORAGE_KEY,
        JSON.stringify(draft),
    );
};

export const clearOnboardingDrafts = (): void => {
    sessionStorage.removeItem(
        "your-shadow:onboarding-personal-data",
    );
    sessionStorage.removeItem(HEALTH_DATA_STORAGE_KEY);
};