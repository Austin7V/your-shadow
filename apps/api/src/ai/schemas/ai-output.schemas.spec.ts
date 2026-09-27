import {
  AI_SCHEMA_VALIDATION_ERROR_CODE,
  AiSchemaValidationError,
  DAILY_PLAN_RESPONSE_FORMAT,
  DAILY_SUMMARY_RESPONSE_FORMAT,
  MEAL_DRAFT_RESPONSE_FORMAT,
  SUBSTITUTION_RESPONSE_FORMAT,
  dailyPlanOutputSchema,
  dailySummaryOutputSchema,
  mealDraftOutputSchema,
  substitutionOutputSchema,
  validateAiOutput,
} from '@your-shadow/contracts';

import {
  AMBIGUOUS_PORTION_MEAL_FIXTURE,
  EXPLICIT_PORTIONS_MEAL_FIXTURE,
  MEAL_PARSING_FIXTURES,
} from '../../meals/testing/meal-parsing.fixtures';

const validDailyPlanOutput = {
  schemaVersion: 1,
  items: [
    {
      type: 'nutrition',
      title: 'Plan breakfast',
      description: 'Choose a simple breakfast with a protein source.',
      source: 'ai',
      explanation: null,
    },
  ],
};

const validMealDraftOutput = EXPLICIT_PORTIONS_MEAL_FIXTURE.output;

const validSubstitutionOutput = {
  schemaVersion: 1,
  originalExerciseId: 'exercise-squat',
  replacementExerciseId: 'exercise-chair-squat',
  reason: 'too_hard',
  explanation: 'This variation provides additional support.',
};

const validDailySummaryOutput = {
  schemaVersion: 1,
  message: 'The main part of the daily plan was completed.',
  completedFacts: ['Completed a walk', 'Logged a meal'],
  tomorrowFocus: 'Maintain a steady pace and complete one small action.',
};

const validFixtures = [
  {
    name: 'daily plan',
    schema: dailyPlanOutputSchema,
    value: validDailyPlanOutput,
  },
  {
    name: 'meal draft',
    schema: mealDraftOutputSchema,
    value: validMealDraftOutput,
  },
  {
    name: 'substitution',
    schema: substitutionOutputSchema,
    value: validSubstitutionOutput,
  },
  {
    name: 'daily summary',
    schema: dailySummaryOutputSchema,
    value: validDailySummaryOutput,
  },
];

const invalidFixtures = [
  {
    name: 'daily plan with unknown item type',
    schema: dailyPlanOutputSchema,
    value: {
      ...validDailyPlanOutput,
      items: [
        {
          ...validDailyPlanOutput.items[0],
          type: 'unknown',
        },
      ],
    },
  },
  {
    name: 'meal draft with invalid quantity',
    schema: mealDraftOutputSchema,
    value: {
      ...validMealDraftOutput,
      foods: [
        {
          ...validMealDraftOutput.foods[0],
          quantity: 0,
        },
      ],
    },
  },
  {
    name: 'substitution with invalid reason',
    schema: substitutionOutputSchema,
    value: {
      ...validSubstitutionOutput,
      reason: 'pain',
    },
  },
  {
    name: 'daily summary with empty message',
    schema: dailySummaryOutputSchema,
    value: {
      ...validDailySummaryOutput,
      message: '',
    },
  },
];

describe('AI output schemas', () => {
  it('accepts valid output for every use case', () => {
    for (const fixture of validFixtures) {
      expect(fixture.schema.safeParse(fixture.value).success).toBe(true);
    }
  });

  it('accepts representative meal parsing fixtures', () => {
    for (const fixture of MEAL_PARSING_FIXTURES) {
      expect(mealDraftOutputSchema.safeParse(fixture.output).success).toBe(
        true,
      );
    }
  });

  it('allows low-confidence meal drafts to request clarification', () => {
    const result = mealDraftOutputSchema.safeParse(
      AMBIGUOUS_PORTION_MEAL_FIXTURE.output,
    );

    expect(result.success).toBe(true);
    expect(AMBIGUOUS_PORTION_MEAL_FIXTURE.output.confidence).toBeLessThan(0.5);
    expect(AMBIGUOUS_PORTION_MEAL_FIXTURE.output.clarification.needed).toBe(
      true,
    );
    expect(
      AMBIGUOUS_PORTION_MEAL_FIXTURE.output.clarification.question,
    ).not.toBeNull();
  });

  it('rejects a meal draft without totals', () => {
    const result = mealDraftOutputSchema.safeParse({
      schemaVersion: validMealDraftOutput.schemaVersion,
      foods: validMealDraftOutput.foods,
      confidence: validMealDraftOutput.confidence,
      clarification: validMealDraftOutput.clarification,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid meal totals', () => {
    const invalidTotals = [
      {
        ...validMealDraftOutput.totals,
        caloriesKcal: -1,
      },
      {
        ...validMealDraftOutput.totals,
        proteinGrams: 501,
      },
      {
        ...validMealDraftOutput.totals,
        fatGrams: -0.1,
      },
      {
        ...validMealDraftOutput.totals,
        carbohydratesGrams: 501,
      },
    ];

    for (const totals of invalidTotals) {
      expect(
        mealDraftOutputSchema.safeParse({
          ...validMealDraftOutput,
          totals,
        }).success,
      ).toBe(false);
    }
  });

  it('rejects an empty clarification question', () => {
    const result = mealDraftOutputSchema.safeParse({
      ...AMBIGUOUS_PORTION_MEAL_FIXTURE.output,
      clarification: {
        needed: true,
        question: ' ',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unsupported schema version', () => {
    for (const fixture of validFixtures) {
      expect(
        fixture.schema.safeParse({
          ...fixture.value,
          schemaVersion: 2,
        }).success,
      ).toBe(false);
    }
  });

  it('rejects unknown fields', () => {
    for (const fixture of validFixtures) {
      expect(
        fixture.schema.safeParse({
          ...fixture.value,
          unexpectedField: 'not-allowed',
        }).success,
      ).toBe(false);
    }
  });

  it('rejects invalid values and ranges', () => {
    for (const fixture of invalidFixtures) {
      expect(fixture.schema.safeParse(fixture.value).success).toBe(false);
    }
  });

  it('maps validation failures without exposing input values', () => {
    const sensitiveValue = 'must-not-appear-in-error';

    try {
      validateAiOutput(dailyPlanOutputSchema, {
        ...validDailyPlanOutput,
        unexpectedField: sensitiveValue,
      });

      throw new Error('Expected schema validation to fail');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AiSchemaValidationError);

      if (!(error instanceof AiSchemaValidationError)) {
        throw error;
      }

      expect(error.code).toBe(AI_SCHEMA_VALIDATION_ERROR_CODE);
      expect(error.message).toBe('AI output failed schema validation');
      expect(error.issues).toContainEqual({
        code: 'unrecognized_keys',
        path: '$',
      });
      expect(JSON.stringify(error)).not.toContain(sensitiveValue);
    }
  });

  it('exports strict JSON schemas for provider requests', () => {
    const responseFormats = [
      DAILY_PLAN_RESPONSE_FORMAT,
      MEAL_DRAFT_RESPONSE_FORMAT,
      SUBSTITUTION_RESPONSE_FORMAT,
      DAILY_SUMMARY_RESPONSE_FORMAT,
    ];

    for (const responseFormat of responseFormats) {
      expect(responseFormat.name).toMatch(/_v1$/);
      expect(responseFormat.schema).toMatchObject({
        type: 'object',
        additionalProperties: false,
      });
    }
  });
});
