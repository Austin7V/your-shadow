export enum MealNutritionValidationAction {
  Accept = 'accept',
  Correct = 'correct',
  Clarify = 'clarify',
}

export enum MealNutritionValidationCode {
  InvalidStructure = 'invalid_structure',
  PortionOutOfRange = 'portion_out_of_range',
  TotalsMismatch = 'totals_mismatch',
  MacroCaloriesMismatch = 'macro_calories_mismatch',
  ClarificationInconsistent = 'clarification_inconsistent',
  ClarificationRequired = 'clarification_required',
}

export interface MealNutritionValidationReason {
  readonly code: MealNutritionValidationCode;
  readonly message: string;
}

export interface MealNutritionValidationResult {
  readonly action: MealNutritionValidationAction;
  readonly reasons: readonly MealNutritionValidationReason[];
}
