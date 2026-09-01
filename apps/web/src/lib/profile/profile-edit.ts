import type {
    ProfileGoal,
    ProfileResponse,
    UpdateProfileRequest,
} from "@/lib/contracts";
import {
    profileGoalOptions,
} from "@/lib/onboarding/personal-data";

export type ProfileEditDraft = {
    heightCm: string;
    timezone: string;
    primaryGoal: ProfileGoal;
    targetWeightKg: string;
};

export type ProfileEditErrors = Partial<
    Record<keyof ProfileEditDraft, string>
>;

const hasMaximumDecimalPlaces = (
    value: string,
    maximumDecimalPlaces: number,
): boolean => {
    const pattern = new RegExp(
        `^\\d+(?:\\.\\d{1,${maximumDecimalPlaces}})?$`,
    );

    return pattern.test(value);
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

export const createProfileEditDraft = (
    profile: ProfileResponse,
): ProfileEditDraft => ({
    heightCm: String(profile.heightCm),
    timezone: profile.timezone,
    primaryGoal: profile.primaryGoal,
    targetWeightKg:
        profile.targetWeightKg === null
            ? ""
            : String(profile.targetWeightKg),
});

export const validateProfileEdit = (
    draft: ProfileEditDraft,
): ProfileEditErrors => {
    const errors: ProfileEditErrors = {};
    const heightCm = Number(draft.heightCm);
    const timezone = draft.timezone.trim();

    if (
        !hasMaximumDecimalPlaces(draft.heightCm, 1) ||
        heightCm < 100 ||
        heightCm > 250
    ) {
        errors.heightCm =
            "Height must be between 100 and 250 cm.";
    }

    if (timezone === "" || !isValidTimeZone(timezone)) {
        errors.timezone = "Enter a valid time zone.";
    }

    if (draft.targetWeightKg !== "") {
        const targetWeightKg = Number(
            draft.targetWeightKg,
        );

        if (
            !hasMaximumDecimalPlaces(
                draft.targetWeightKg,
                2,
            ) ||
            targetWeightKg < 30 ||
            targetWeightKg > 500
        ) {
            errors.targetWeightKg =
                "Target weight must be between 30 and 500 kg.";
        }
    }

    return errors;
};

export const createProfileUpdateRequest = (
    draft: ProfileEditDraft,
): UpdateProfileRequest => ({
    heightCm: Number(draft.heightCm),
    timezone: draft.timezone.trim(),
    primaryGoal: draft.primaryGoal,
    targetWeightKg:
        draft.targetWeightKg === ""
            ? null
            : Number(draft.targetWeightKg),
});

export const getProfileGoalLabel = (
    goal: ProfileGoal,
): string => {
    return (
        profileGoalOptions.find(
            (option) => option.value === goal,
        )?.label ?? goal
    );
};