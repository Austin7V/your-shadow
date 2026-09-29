import { MEAL_QUANTITY_UNITS } from '@your-shadow/contracts';

export type MealQuantityUnit = (typeof MEAL_QUANTITY_UNITS)[number];

export interface MealPortionLimit {
  readonly minimum: number;
  readonly maximum: number;
}

export const MEAL_MACRO_CALORIE_FACTORS = {
  proteinGrams: 4,
  fatGrams: 9,
  carbohydratesGrams: 4,
} as const;

export const MEAL_NUTRITION_VALIDATION_LIMITS = {
  lowConfidenceThreshold: 0.5,
  totalsCaloriesToleranceKcal: 10,
  totalsMacroToleranceGrams: 1,
  itemMacroCaloriesAbsoluteToleranceKcal: 30,
  totalMacroCaloriesAbsoluteToleranceKcal: 100,
  macroCaloriesRelativeTolerance: 0.25,
} as const;

export const MEAL_PORTION_LIMITS = {
  g: {
    minimum: 1,
    maximum: 5_000,
  },
  ml: {
    minimum: 1,
    maximum: 5_000,
  },
  piece: {
    minimum: 0.25,
    maximum: 50,
  },
  portion: {
    minimum: 0.25,
    maximum: 20,
  },
  slice: {
    minimum: 0.25,
    maximum: 50,
  },
  tablespoon: {
    minimum: 0.25,
    maximum: 100,
  },
  teaspoon: {
    minimum: 0.25,
    maximum: 300,
  },
} as const satisfies Record<MealQuantityUnit, MealPortionLimit>;
