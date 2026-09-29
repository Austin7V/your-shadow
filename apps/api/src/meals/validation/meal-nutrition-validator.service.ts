import { Injectable } from '@nestjs/common';
import { mealDraftOutputSchema } from '@your-shadow/contracts';

import {
  MEAL_MACRO_CALORIE_FACTORS,
  MEAL_NUTRITION_VALIDATION_LIMITS,
  MEAL_PORTION_LIMITS,
} from './meal-nutrition-validation.constants';
import {
  MealNutritionValidationAction,
  MealNutritionValidationCode,
  type MealNutritionValidationReason,
  type MealNutritionValidationResult,
} from './meal-nutrition-validation.types';

type MealQuantityUnit = keyof typeof MEAL_PORTION_LIMITS;

interface NutritionValues {
  readonly caloriesKcal: number;
  readonly proteinGrams: number;
  readonly fatGrams: number;
  readonly carbohydratesGrams: number;
}

interface ValidatedMealFood extends NutritionValues {
  readonly quantity: number;
  readonly unit: MealQuantityUnit;
  readonly confidence: number;
}

interface ValidatedMealDraft {
  readonly foods: readonly ValidatedMealFood[];
  readonly totals: NutritionValues;
  readonly confidence: number;
  readonly clarification: {
    readonly needed: boolean;
    readonly question: string | null;
  };
}

const VALIDATION_MESSAGES = {
  invalidStructure: 'Nutrition data has an invalid structure.',
  portionOutOfRange: 'A food portion is outside the supported range.',
  totalsMismatch: 'Nutrition totals do not match the listed foods.',
  macroCaloriesMismatch: 'Calories and macronutrients need review.',
  clarificationInconsistent: 'Clarification information is incomplete.',
  clarificationRequired: 'More meal details are required before confirmation.',
} as const;

@Injectable()
export class MealNutritionValidatorService {
  validate(value: unknown): MealNutritionValidationResult {
    const parsedResult = mealDraftOutputSchema.safeParse(value);

    if (!parsedResult.success) {
      return {
        action: MealNutritionValidationAction.Correct,
        reasons: [
          this.createReason(
            MealNutritionValidationCode.InvalidStructure,
            VALIDATION_MESSAGES.invalidStructure,
          ),
        ],
      };
    }

    const mealDraft: ValidatedMealDraft = parsedResult.data;
    const correctionReasons: MealNutritionValidationReason[] = [];
    const clarificationReasons: MealNutritionValidationReason[] = [];

    if (mealDraft.foods.some((food) => !this.hasValidPortion(food))) {
      this.addReason(
        correctionReasons,
        MealNutritionValidationCode.PortionOutOfRange,
        VALIDATION_MESSAGES.portionOutOfRange,
      );
    }

    if (!this.totalsMatchFoods(mealDraft)) {
      this.addReason(
        correctionReasons,
        MealNutritionValidationCode.TotalsMismatch,
        VALIDATION_MESSAGES.totalsMismatch,
      );
    }

    const clarificationIsConsistent =
      this.hasConsistentClarification(mealDraft);

    if (!clarificationIsConsistent) {
      this.addReason(
        correctionReasons,
        MealNutritionValidationCode.ClarificationInconsistent,
        VALIDATION_MESSAGES.clarificationInconsistent,
      );
    }

    const hasMacroCaloriesMismatch =
      mealDraft.foods.some((food) =>
        this.hasMacroCaloriesMismatch(
          food,
          MEAL_NUTRITION_VALIDATION_LIMITS.itemMacroCaloriesAbsoluteToleranceKcal,
        ),
      ) ||
      this.hasMacroCaloriesMismatch(
        mealDraft.totals,
        MEAL_NUTRITION_VALIDATION_LIMITS.totalMacroCaloriesAbsoluteToleranceKcal,
      );

    if (hasMacroCaloriesMismatch) {
      const targetReasons =
        clarificationIsConsistent && mealDraft.clarification.needed
          ? clarificationReasons
          : correctionReasons;

      this.addReason(
        targetReasons,
        MealNutritionValidationCode.MacroCaloriesMismatch,
        VALIDATION_MESSAGES.macroCaloriesMismatch,
      );
    }

    const hasLowConfidence =
      mealDraft.confidence <
        MEAL_NUTRITION_VALIDATION_LIMITS.lowConfidenceThreshold ||
      mealDraft.foods.some(
        (food) =>
          food.confidence <
          MEAL_NUTRITION_VALIDATION_LIMITS.lowConfidenceThreshold,
      );

    if (mealDraft.clarification.needed && clarificationIsConsistent) {
      this.addReason(
        clarificationReasons,
        MealNutritionValidationCode.ClarificationRequired,
        VALIDATION_MESSAGES.clarificationRequired,
      );
    } else if (hasLowConfidence) {
      this.addReason(
        correctionReasons,
        MealNutritionValidationCode.ClarificationRequired,
        VALIDATION_MESSAGES.clarificationRequired,
      );
    }

    if (correctionReasons.length > 0) {
      return {
        action: MealNutritionValidationAction.Correct,
        reasons: [...correctionReasons, ...clarificationReasons],
      };
    }

    if (clarificationReasons.length > 0) {
      return {
        action: MealNutritionValidationAction.Clarify,
        reasons: clarificationReasons,
      };
    }

    return {
      action: MealNutritionValidationAction.Accept,
      reasons: [],
    };
  }

  private hasValidPortion(food: ValidatedMealFood): boolean {
    const limits = MEAL_PORTION_LIMITS[food.unit];

    return food.quantity >= limits.minimum && food.quantity <= limits.maximum;
  }

  private totalsMatchFoods(mealDraft: ValidatedMealDraft): boolean {
    const calculatedTotals = {
      caloriesKcal: 0,
      proteinGrams: 0,
      fatGrams: 0,
      carbohydratesGrams: 0,
    };

    for (const food of mealDraft.foods) {
      calculatedTotals.caloriesKcal += food.caloriesKcal;
      calculatedTotals.proteinGrams += food.proteinGrams;
      calculatedTotals.fatGrams += food.fatGrams;
      calculatedTotals.carbohydratesGrams += food.carbohydratesGrams;
    }

    return (
      this.isWithinTolerance(
        mealDraft.totals.caloriesKcal,
        calculatedTotals.caloriesKcal,
        MEAL_NUTRITION_VALIDATION_LIMITS.totalsCaloriesToleranceKcal,
      ) &&
      this.isWithinTolerance(
        mealDraft.totals.proteinGrams,
        calculatedTotals.proteinGrams,
        MEAL_NUTRITION_VALIDATION_LIMITS.totalsMacroToleranceGrams,
      ) &&
      this.isWithinTolerance(
        mealDraft.totals.fatGrams,
        calculatedTotals.fatGrams,
        MEAL_NUTRITION_VALIDATION_LIMITS.totalsMacroToleranceGrams,
      ) &&
      this.isWithinTolerance(
        mealDraft.totals.carbohydratesGrams,
        calculatedTotals.carbohydratesGrams,
        MEAL_NUTRITION_VALIDATION_LIMITS.totalsMacroToleranceGrams,
      )
    );
  }

  private hasMacroCaloriesMismatch(
    nutrition: NutritionValues,
    absoluteToleranceKcal: number,
  ): boolean {
    const calculatedCalories =
      nutrition.proteinGrams * MEAL_MACRO_CALORIE_FACTORS.proteinGrams +
      nutrition.fatGrams * MEAL_MACRO_CALORIE_FACTORS.fatGrams +
      nutrition.carbohydratesGrams *
        MEAL_MACRO_CALORIE_FACTORS.carbohydratesGrams;

    const difference = Math.abs(nutrition.caloriesKcal - calculatedCalories);
    const relativeBase = Math.max(
      nutrition.caloriesKcal,
      calculatedCalories,
      1,
    );
    const relativeTolerance =
      relativeBase *
      MEAL_NUTRITION_VALIDATION_LIMITS.macroCaloriesRelativeTolerance;
    const allowedDifference = Math.max(
      absoluteToleranceKcal,
      relativeTolerance,
    );

    return difference > allowedDifference;
  }

  private hasConsistentClarification(mealDraft: ValidatedMealDraft): boolean {
    if (mealDraft.clarification.needed) {
      return mealDraft.clarification.question !== null;
    }

    return mealDraft.clarification.question === null;
  }

  private isWithinTolerance(
    actual: number,
    expected: number,
    tolerance: number,
  ): boolean {
    return Math.abs(actual - expected) <= tolerance;
  }

  private addReason(
    reasons: MealNutritionValidationReason[],
    code: MealNutritionValidationCode,
    message: string,
  ): void {
    if (reasons.some((reason) => reason.code === code)) {
      return;
    }

    reasons.push(this.createReason(code, message));
  }

  private createReason(
    code: MealNutritionValidationCode,
    message: string,
  ): MealNutritionValidationReason {
    return {
      code,
      message,
    };
  }
}
