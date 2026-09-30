import { z } from "zod";

import {
  mealNutritionTotalsSchema,
  type MealDraftOutput,
} from "../ai/meal-draft-output.schema";

export const MEAL_DESCRIPTION_LIMITS = {
  minimumLength: 1,
  maximumLength: 500,
} as const;

export type ParseMealRequest = {
  originalText: string;
};

export type ManualMealFallback = {
  status: "manual_entry_required";
  reason: "ai_unavailable";
  originalText: string;
  nutrition: {
    caloriesKcal: null;
    proteinGrams: null;
    fatGrams: null;
    carbohydratesGrams: null;
  };
};

export type ParseMealResponse = MealDraftOutput | ManualMealFallback;

export const manualMealDraftSchema = z.strictObject({
  originalText: z
    .string()
    .min(MEAL_DESCRIPTION_LIMITS.minimumLength)
    .max(MEAL_DESCRIPTION_LIMITS.maximumLength)
    .refine((text) => text.trim().length > 0),
  nutrition: mealNutritionTotalsSchema,
});

export type ManualMealDraft = z.infer<typeof manualMealDraftSchema>;
