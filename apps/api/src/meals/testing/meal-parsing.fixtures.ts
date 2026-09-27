import {
  AI_OUTPUT_SCHEMA_VERSIONS,
  type MealDraftOutput,
} from '@your-shadow/contracts';

export interface MealParsingFixture {
  readonly name: string;
  readonly originalText: string;
  readonly output: MealDraftOutput;
}

export const EXPLICIT_PORTIONS_MEAL_FIXTURE = {
  name: 'explicit portions',
  originalText: '200 g grilled chicken breast with 150 g cooked rice',
  output: {
    schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.mealDraft,
    foods: [
      {
        name: 'Grilled chicken breast',
        quantity: 200,
        unit: 'g',
        caloriesKcal: 330,
        proteinGrams: 62,
        fatGrams: 7.2,
        carbohydratesGrams: 0,
        confidence: 0.95,
        isEstimate: true,
      },
      {
        name: 'Cooked rice',
        quantity: 150,
        unit: 'g',
        caloriesKcal: 195,
        proteinGrams: 4,
        fatGrams: 0.5,
        carbohydratesGrams: 42,
        confidence: 0.95,
        isEstimate: true,
      },
    ],
    totals: {
      caloriesKcal: 525,
      proteinGrams: 66,
      fatGrams: 7.7,
      carbohydratesGrams: 42,
    },
    confidence: 0.95,
    clarification: {
      needed: false,
      question: null,
    },
  },
} satisfies MealParsingFixture;

export const AMBIGUOUS_PORTION_MEAL_FIXTURE = {
  name: 'ambiguous portion',
  originalText: 'A bowl of homemade soup',
  output: {
    schemaVersion: AI_OUTPUT_SCHEMA_VERSIONS.mealDraft,
    foods: [
      {
        name: 'Homemade soup',
        quantity: 1,
        unit: 'portion',
        caloriesKcal: 250,
        proteinGrams: 10,
        fatGrams: 8,
        carbohydratesGrams: 32,
        confidence: 0.35,
        isEstimate: true,
      },
    ],
    totals: {
      caloriesKcal: 250,
      proteinGrams: 10,
      fatGrams: 8,
      carbohydratesGrams: 32,
    },
    confidence: 0.35,
    clarification: {
      needed: true,
      question:
        'Approximately how large was the bowl, and what were the main ingredients?',
    },
  },
} satisfies MealParsingFixture;

export const MEAL_PARSING_FIXTURES = [
  EXPLICIT_PORTIONS_MEAL_FIXTURE,
  AMBIGUOUS_PORTION_MEAL_FIXTURE,
] as const satisfies readonly MealParsingFixture[];
