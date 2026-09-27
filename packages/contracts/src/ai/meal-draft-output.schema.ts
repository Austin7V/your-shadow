import { z } from "zod";

import {
  AI_OUTPUT_SCHEMA_VERSIONS,
  createVersionedAiOutputSchema,
} from "./ai-output-schema";

export const MEAL_QUANTITY_UNITS = [
  "g",
  "ml",
  "piece",
  "portion",
  "slice",
  "tablespoon",
  "teaspoon",
] as const;

const MEAL_NUTRITION_SHAPE = {
  caloriesKcal: z.number().int().min(0).max(5_000),
  proteinGrams: z.number().min(0).max(500),
  fatGrams: z.number().min(0).max(500),
  carbohydratesGrams: z.number().min(0).max(500),
} as const;

export const mealNutritionTotalsSchema = z.strictObject(MEAL_NUTRITION_SHAPE);

export const mealDraftClarificationSchema = z.strictObject({
  needed: z.boolean(),
  question: z.string().trim().min(1).max(300).nullable(),
});

export const mealDraftFoodSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  quantity: z.number().min(0.01).max(10_000),
  unit: z.enum(MEAL_QUANTITY_UNITS),
  ...MEAL_NUTRITION_SHAPE,
  confidence: z.number().min(0).max(1),
  isEstimate: z.literal(true),
});

export const mealDraftOutputSchema = createVersionedAiOutputSchema(
  AI_OUTPUT_SCHEMA_VERSIONS.mealDraft,
  {
    foods: z.array(mealDraftFoodSchema).min(1).max(20),
    totals: mealNutritionTotalsSchema,
    confidence: z.number().min(0).max(1),
    clarification: mealDraftClarificationSchema,
  },
);

export const MEAL_DRAFT_RESPONSE_FORMAT = {
  name: "meal_draft_v1",
  schema: z.toJSONSchema(mealDraftOutputSchema),
} as const;

export type MealNutritionTotals = z.infer<typeof mealNutritionTotalsSchema>;
export type MealDraftClarification = z.infer<
  typeof mealDraftClarificationSchema
>;
export type MealDraftFoodOutput = z.infer<typeof mealDraftFoodSchema>;
export type MealDraftOutput = z.infer<typeof mealDraftOutputSchema>;
