import type { MealNutritionTotals } from "../ai/meal-draft-output.schema";

export type DailyNutritionTotalsResponse = MealNutritionTotals & {
  localDate: string;
  mealCount: number;
};
