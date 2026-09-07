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

const validDailyPlanOutput = {
  schemaVersion: 1,
  items: [
    {
      type: 'nutrition',
      title: 'Запланировать завтрак',
      description: 'Выбрать простой завтрак с источником белка.',
      source: 'ai',
      explanation: null,
    },
  ],
};

const validMealDraftOutput = {
  schemaVersion: 1,
  foods: [
    {
      name: 'Овсяная каша',
      quantity: 250,
      unit: 'g',
      caloriesKcal: 280,
      proteinGrams: 9,
      fatGrams: 6,
      carbohydratesGrams: 48,
      confidence: 0.9,
      isEstimate: true,
    },
  ],
};

const validSubstitutionOutput = {
  schemaVersion: 1,
  originalExerciseId: 'exercise-squat',
  replacementExerciseId: 'exercise-chair-squat',
  reason: 'too_hard',
  explanation: 'Этот вариант выполняется с дополнительной опорой.',
};

const validDailySummaryOutput = {
  schemaVersion: 1,
  message: 'Сегодня удалось выполнить основную часть плана.',
  completedFacts: ['Завершена прогулка', 'Добавлен приём пищи'],
  tomorrowFocus: 'Сохранить спокойный темп и выполнить один небольшой шаг.',
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
