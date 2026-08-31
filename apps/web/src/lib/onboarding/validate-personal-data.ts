import { PROFILE_GOALS } from "@/lib/contracts";
import type { PersonalDataDraft } from "@/lib/onboarding/personal-data";

export type PersonalDataErrors = Partial<
  Record<keyof PersonalDataDraft, string>
>;

const hasMaximumDecimalPlaces = (
  value: string,
  maximumDecimalPlaces: number,
): boolean => {
  const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${maximumDecimalPlaces}})?$`);

  return pattern.test(value);
};

const isValidDate = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const getAge = (dateOfBirth: string): number => {
  const today = new Date();

  const year = Number(dateOfBirth.slice(0, 4));
  const month = Number(dateOfBirth.slice(5, 7));
  const day = Number(dateOfBirth.slice(8, 10));

  let age = today.getFullYear() - year;

  const birthdayHasPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
};

const isValidTimeZone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: value,
    }).format();

    return true;
  } catch {
    return false;
  }
};

export const validatePersonalData = (
  draft: PersonalDataDraft,
): PersonalDataErrors => {
  const errors: PersonalDataErrors = {};
  const firstName = draft.firstName.trim();
  const lastName = draft.lastName.trim();
  const userName = draft.userName.trim();
  const timezone = draft.timezone.trim();

  if (firstName.length < 1 || firstName.length > 100) {
    errors.firstName = "Enter a valid first name.";
  }

  if (lastName.length < 1 || lastName.length > 100) {
    errors.lastName = "Enter a valid last name.";
  }

  if (userName.length < 1 || userName.length > 50) {
    errors.userName = "Enter a display name of up to 50 characters.";
  }

  if (!isValidDate(draft.dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date of birth.";
  } else {
    const age = getAge(draft.dateOfBirth);

    if (age < 18) {
      errors.dateOfBirth = "You must be at least 18 years old.";
    } else if (age > 120) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    }
  }

  const heightCm = Number(draft.heightCm);

  if (
    !hasMaximumDecimalPlaces(draft.heightCm, 1) ||
    heightCm < 100 ||
    heightCm > 250
  ) {
    errors.heightCm = "Height must be between 100 and 250 cm.";
  }

  const currentWeightKg = Number(draft.currentWeightKg);

  if (
    !hasMaximumDecimalPlaces(draft.currentWeightKg, 2) ||
    currentWeightKg < 30 ||
    currentWeightKg > 500
  ) {
    errors.currentWeightKg = "Weight must be between 30 and 500 kg.";
  }

  if (draft.targetWeightKg !== "") {
    const targetWeightKg = Number(draft.targetWeightKg);

    if (
      !hasMaximumDecimalPlaces(draft.targetWeightKg, 2) ||
      targetWeightKg < 30 ||
      targetWeightKg > 500
    ) {
      errors.targetWeightKg = "Target weight must be between 30 and 500 kg.";
    }
  }

  if (
    draft.primaryGoal === "" ||
    !(PROFILE_GOALS as readonly string[]).includes(draft.primaryGoal)
  ) {
    errors.primaryGoal = "Choose your primary goal.";
  }

  if (timezone === "" || !isValidTimeZone(timezone)) {
    errors.timezone = "Enter a valid time zone.";
  }

  return errors;
};

export const normalizePersonalData = (
  draft: PersonalDataDraft,
): PersonalDataDraft => ({
  ...draft,
  firstName: draft.firstName.trim(),
  lastName: draft.lastName.trim(),
  userName: draft.userName.trim(),
  timezone: draft.timezone.trim(),
});
