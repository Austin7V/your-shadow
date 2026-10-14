import { z } from "zod";

import {
  mealDraftFoodSchema,
  mealNutritionTotalsSchema,
} from "../ai/meal-draft-output.schema";
import { manualMealDraftSchema } from "./meal-parsing.contract";

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

const commonFields = {
  mealType: z.enum(MEAL_TYPES),
  originalText: manualMealDraftSchema.shape.originalText,
};

export const confirmMealRequestSchema = z.discriminatedUnion("source", [
  z.strictObject({
    ...commonFields,
    source: z.literal("ai"),
    foods: z.array(mealDraftFoodSchema).min(1).max(20),
    totals: mealNutritionTotalsSchema,
  }),
  z.strictObject({
    ...commonFields,
    source: z.literal("manual"),
    nutrition: mealNutritionTotalsSchema,
  }),
]);

export type ConfirmMealRequest = z.infer<typeof confirmMealRequestSchema>;

export type ConfirmMealResponse = {
  id: string;
  status: "confirmed";
  source: ConfirmMealRequest["source"];
  mealType: MealType;
  localDate: string;
  confirmedAt: string;
};
