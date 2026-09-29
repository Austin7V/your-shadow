import {
  AMBIGUOUS_PORTION_MEAL_FIXTURE,
  EXPLICIT_PORTIONS_MEAL_FIXTURE,
} from '../testing/meal-parsing.fixtures';
import { MealNutritionValidatorService } from './meal-nutrition-validator.service';
import {
  MealNutritionValidationAction,
  MealNutritionValidationCode,
} from './meal-nutrition-validation.types';

type MealQuantityUnit =
  'g' | 'ml' | 'piece' | 'portion' | 'slice' | 'tablespoon' | 'teaspoon';

interface TestMealFood {
  name: string;
  quantity: number;
  unit: MealQuantityUnit;
  caloriesKcal: number;
  proteinGrams: number;
  fatGrams: number;
  carbohydratesGrams: number;
  confidence: number;
  isEstimate: true;
}

interface TestMealDraft {
  schemaVersion: 1;
  foods: TestMealFood[];
  totals: {
    caloriesKcal: number;
    proteinGrams: number;
    fatGrams: number;
    carbohydratesGrams: number;
  };
  confidence: number;
  clarification: {
    needed: boolean;
    question: string | null;
  };
}

const VALID_PORTION_BOUNDARIES: ReadonlyArray<
  readonly [MealQuantityUnit, number]
> = [
  ['g', 1],
  ['g', 5_000],
  ['ml', 1],
  ['ml', 5_000],
  ['piece', 0.25],
  ['piece', 50],
  ['portion', 0.25],
  ['portion', 20],
  ['slice', 0.25],
  ['slice', 50],
  ['tablespoon', 0.25],
  ['tablespoon', 100],
  ['teaspoon', 0.25],
  ['teaspoon', 300],
];

function createExplicitMealDraft(): TestMealDraft {
  const output = EXPLICIT_PORTIONS_MEAL_FIXTURE.output;

  return {
    schemaVersion: output.schemaVersion,
    foods: output.foods.map((food) => ({
      ...food,
    })),
    totals: {
      ...output.totals,
    },
    confidence: output.confidence,
    clarification: {
      ...output.clarification,
    },
  };
}

function getFirstFood(mealDraft: TestMealDraft): TestMealFood {
  const firstFood = mealDraft.foods[0];

  if (!firstFood) {
    throw new Error('Expected the meal draft to contain food.');
  }

  return firstFood;
}

describe('MealNutritionValidatorService', () => {
  const service = new MealNutritionValidatorService();

  it('accepts a valid high-confidence meal draft', () => {
    const result = service.validate(createExplicitMealDraft());

    expect(result).toEqual({
      action: MealNutritionValidationAction.Accept,
      reasons: [],
    });
  });

  it('requests clarification for an ambiguous portion fixture', () => {
    const result = service.validate(AMBIGUOUS_PORTION_MEAL_FIXTURE.output);

    expect(result.action).toBe(MealNutritionValidationAction.Clarify);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.ClarificationRequired,
      }),
    );
  });

  it('rejects negative nutrition values as an invalid structure', () => {
    const mealDraft = createExplicitMealDraft();
    const firstFood = getFirstFood(mealDraft);

    firstFood.caloriesKcal = -1;

    const result = service.validate(mealDraft);

    expect(result).toEqual({
      action: MealNutritionValidationAction.Correct,
      reasons: [
        {
          code: MealNutritionValidationCode.InvalidStructure,
          message: 'Nutrition data has an invalid structure.',
        },
      ],
    });
  });

  it('rejects extreme nutrition values as an invalid structure', () => {
    const mealDraft = createExplicitMealDraft();
    const firstFood = getFirstFood(mealDraft);

    firstFood.caloriesKcal = 5_001;

    const result = service.validate(mealDraft);

    expect(result).toEqual({
      action: MealNutritionValidationAction.Correct,
      reasons: [
        {
          code: MealNutritionValidationCode.InvalidStructure,
          message: 'Nutrition data has an invalid structure.',
        },
      ],
    });
  });

  it.each(VALID_PORTION_BOUNDARIES)(
    'accepts the supported %s portion boundary %s',
    (unit, quantity) => {
      const mealDraft = createExplicitMealDraft();
      const firstFood = getFirstFood(mealDraft);

      firstFood.unit = unit;
      firstFood.quantity = quantity;

      const result = service.validate(mealDraft);

      expect(result.action).toBe(MealNutritionValidationAction.Accept);
    },
  );

  it.each([
    ['g', 0.99],
    ['g', 5_000.01],
    ['piece', 0.24],
    ['piece', 50.01],
    ['portion', 20.01],
    ['tablespoon', 100.01],
    ['teaspoon', 300.01],
  ] as const)(
    'rejects the unsupported %s portion quantity %s',
    (unit, quantity) => {
      const mealDraft = createExplicitMealDraft();
      const firstFood = getFirstFood(mealDraft);

      firstFood.unit = unit;
      firstFood.quantity = quantity;

      const result = service.validate(mealDraft);

      expect(result.action).toBe(MealNutritionValidationAction.Correct);
      expect(result.reasons).toContainEqual(
        expect.objectContaining({
          code: MealNutritionValidationCode.PortionOutOfRange,
        }),
      );
    },
  );

  it('accepts totals at the configured calorie tolerance boundary', () => {
    const mealDraft = createExplicitMealDraft();

    mealDraft.totals.caloriesKcal += 10;

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Accept);
  });

  it('rejects totals outside the configured calorie tolerance', () => {
    const mealDraft = createExplicitMealDraft();

    mealDraft.totals.caloriesKcal += 11;

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Correct);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.TotalsMismatch,
      }),
    );
  });

  it('requires correction for a macro-calorie mismatch', () => {
    const mealDraft = createExplicitMealDraft();
    const firstFood = getFirstFood(mealDraft);

    firstFood.caloriesKcal += 1_000;
    mealDraft.totals.caloriesKcal += 1_000;

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Correct);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.MacroCaloriesMismatch,
      }),
    );
    expect(result.reasons).not.toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.TotalsMismatch,
      }),
    );
  });

  it('requests clarification for a declared macro-calorie uncertainty', () => {
    const mealDraft = createExplicitMealDraft();
    const firstFood = getFirstFood(mealDraft);

    firstFood.caloriesKcal += 1_000;
    mealDraft.totals.caloriesKcal += 1_000;
    mealDraft.clarification = {
      needed: true,
      question: 'How large was the serving?',
    };

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Clarify);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: MealNutritionValidationCode.MacroCaloriesMismatch,
        }),
        expect.objectContaining({
          code: MealNutritionValidationCode.ClarificationRequired,
        }),
      ]),
    );
  });

  it('requires clarification details for low-confidence data', () => {
    const mealDraft = createExplicitMealDraft();

    mealDraft.confidence = 0.49;

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Correct);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.ClarificationRequired,
      }),
    );
  });

  it('rejects inconsistent clarification information', () => {
    const mealDraft = createExplicitMealDraft();

    mealDraft.clarification = {
      needed: true,
      question: null,
    };

    const result = service.validate(mealDraft);

    expect(result.action).toBe(MealNutritionValidationAction.Correct);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: MealNutritionValidationCode.ClarificationInconsistent,
      }),
    );
  });

  it('does not expose submitted meal data in validation reasons', () => {
    const sensitiveMealText =
      'Private medical diet and confidential meal details';

    const result = service.validate({
      rawMeal: sensitiveMealText,
    });

    expect(JSON.stringify(result)).not.toContain(sensitiveMealText);
    expect(result).toEqual({
      action: MealNutritionValidationAction.Correct,
      reasons: [
        {
          code: MealNutritionValidationCode.InvalidStructure,
          message: 'Nutrition data has an invalid structure.',
        },
      ],
    });
  });
});
