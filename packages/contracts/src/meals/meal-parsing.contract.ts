import type { MealDraftOutput } from "../ai/meal-draft-output.schema";

export const MEAL_DESCRIPTION_LIMITS = {
  minimumLength: 2,
  maximumLength: 500,
} as const;

export type ParseMealRequest = {
  originalText: string;
};

export type ParseMealResponse = MealDraftOutput;
