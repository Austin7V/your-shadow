import { PROFILE_GOALS, type ProfileGoal } from "@/lib/contracts";

export const PERSONAL_DATA_STORAGE_KEY = "your-shadow:onboarding-personal-data";

export type PersonalDataDraft = {
  firstName: string;
  lastName: string;
  userName: string;
  dateOfBirth: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  timezone: string;
  primaryGoal: ProfileGoal | "";
};

export const profileGoalOptions: Array<{
  value: ProfileGoal;
  label: string;
}> = [
  {
    value: "lose_weight",
    label: "Lose weight",
  },
  {
    value: "gain_weight",
    label: "Gain weight",
  },
  {
    value: "maintain_weight",
    label: "Maintain weight",
  },
  {
    value: "improve_fitness",
    label: "Improve fitness",
  },
  {
    value: "general_wellness",
    label: "General wellness",
  },
];

export const createEmptyPersonalDataDraft = (): PersonalDataDraft => ({
  firstName: "",
  lastName: "",
  userName: "",
  dateOfBirth: "",
  heightCm: "",
  currentWeightKg: "",
  targetWeightKg: "",
  timezone: "",
  primaryGoal: "",
});

const isPersonalDataDraft = (value: unknown): value is PersonalDataDraft => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const draft = value as Record<string, unknown>;

  const hasValidGoal =
    draft.primaryGoal === "" ||
    (typeof draft.primaryGoal === "string" &&
      (PROFILE_GOALS as readonly string[]).includes(draft.primaryGoal));

  return (
    typeof draft.firstName === "string" &&
    typeof draft.lastName === "string" &&
    typeof draft.userName === "string" &&
    typeof draft.dateOfBirth === "string" &&
    typeof draft.heightCm === "string" &&
    typeof draft.currentWeightKg === "string" &&
    typeof draft.targetWeightKg === "string" &&
    typeof draft.timezone === "string" &&
    hasValidGoal
  );
};

export const loadPersonalDataDraft = (): PersonalDataDraft => {
  const emptyDraft = createEmptyPersonalDataDraft();

  const defaultDraft: PersonalDataDraft = {
    ...emptyDraft,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };

  const storedValue = sessionStorage.getItem(PERSONAL_DATA_STORAGE_KEY);

  if (storedValue === null) {
    return defaultDraft;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (isPersonalDataDraft(parsedValue)) {
      return parsedValue;
    }
  } catch {
    return defaultDraft;
  }

  return defaultDraft;
};

export const savePersonalDataDraft = (draft: PersonalDataDraft): void => {
  sessionStorage.setItem(PERSONAL_DATA_STORAGE_KEY, JSON.stringify(draft));
};
