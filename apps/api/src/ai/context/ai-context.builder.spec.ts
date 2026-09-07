import { AiCapability } from '../ai-provider.contract';
import {
  buildAskShadowAiContext,
  buildDailyPlanAiContext,
  buildDailySummaryAiContext,
  buildMealDraftAiContext,
  buildMemoryExtractionAiContext,
  buildRecipeSuggestionAiContext,
  type AiHealthConstraintSource,
} from './ai-context.builder';
import { AI_CONTEXT_LIMITS, AI_CONTEXT_VERSION } from './ai-context.types';

describe('AI context builder', () => {
  it('creates a minimal daily plan context', () => {
    const constraints: Array<
      AiHealthConstraintSource & {
        notes: string;
      }
    > = [
      {
        type: 'allergy',
        severity: 'high',
        title: `private@example.com ${'x'.repeat(200)}`,
        isActive: true,
        notes: 'Полная медицинская заметка не должна попасть в AI.',
      },
      {
        type: 'injury',
        severity: 'moderate',
        title: 'Неактивная травма',
        isActive: false,
        notes: 'Это ограничение больше не активно.',
      },
    ];

    const input = {
      primaryGoal: 'lose_weight' as const,
      currentWeightKg: 110,
      targetWeightKg: 95,
      constraints,
      latestSummary: {
        text: 'Выполнена прогулка.',
        date: '2026-09-06T21:30:00.000Z',
      },

      email: 'private@example.com',
      password: 'secret-password',
      accessToken: 'secret-access-token',
      chatHistory: ['Полная история разговора'],
    };

    const result = buildDailyPlanAiContext(input);
    const serializedResult = JSON.stringify(result);

    expect(result.contextVersion).toBe(AI_CONTEXT_VERSION);
    expect(result.capability).toBe(AiCapability.DailyPlan);
    expect(result.context.activeConstraints).toHaveLength(1);
    expect(result.context.activeConstraints[0]).toMatchObject({
      type: 'allergy',
      severity: 'high',
    });
    expect(typeof result.context.activeConstraints[0]?.title).toBe('string');
    expect(
      result.context.activeConstraints[0]?.title.length,
    ).toBeLessThanOrEqual(AI_CONTEXT_LIMITS.constraintTitleCharacters);
    expect(result.context.latestSummary).toEqual({
      text: 'Выполнена прогулка.',
      source: 'daily_summary',
      date: '2026-09-06',
    });

    expect(serializedResult).not.toContain('notes');
    expect(serializedResult).not.toContain('password');
    expect(serializedResult).not.toContain('accessToken');
    expect(serializedResult).not.toContain('chatHistory');
    expect(serializedResult).not.toContain('private@example.com');
    expect(serializedResult).toContain('[REDACTED]');
  });

  it('uses only active allergies for meal and recipe contexts', () => {
    const input = {
      locale: 'ru-RU',
      primaryGoal: 'lose_weight' as const,
      constraints: [
        {
          type: 'allergy' as const,
          severity: 'high' as const,
          title: 'Арахис',
          isActive: true,
        },
        {
          type: 'injury' as const,
          severity: 'moderate' as const,
          title: 'Колено',
          isActive: true,
        },
        {
          type: 'allergy' as const,
          severity: 'low' as const,
          title: 'Неактивная аллергия',
          isActive: false,
        },
      ],
    };

    const results = [
      buildMealDraftAiContext(input),
      buildRecipeSuggestionAiContext(input),
    ];

    expect(results.map((result) => result.capability)).toEqual([
      AiCapability.MealDraft,
      AiCapability.RecipeSuggestion,
    ]);

    for (const result of results) {
      expect(result.context.allergies).toEqual([
        {
          type: 'allergy',
          severity: 'high',
          title: 'Арахис',
        },
      ]);
    }
  });

  it('limits confirmed facts for summary and memory extraction', () => {
    const input = {
      localDate: '2026-09-07T12:00:00.000Z',
      confirmedFacts: Array.from(
        {
          length: AI_CONTEXT_LIMITS.confirmedFactCount + 5,
        },
        (_, index) => ({
          text: `Подтверждённый факт ${index + 1}`,
          source: 'plan' as const,
        }),
      ),

      // Builder не копирует исходные тексты и технические данные.
      rawMealText: 'Полный текст приёма пищи',
      providerToken: 'secret-provider-token',
    };

    const results = [
      buildDailySummaryAiContext(input),
      buildMemoryExtractionAiContext(input),
    ];

    expect(results.map((result) => result.capability)).toEqual([
      AiCapability.DailySummary,
      AiCapability.MemoryExtraction,
    ]);

    for (const result of results) {
      expect(result.context.localDate).toBe('2026-09-07');
      expect(result.context.confirmedFacts).toHaveLength(
        AI_CONTEXT_LIMITS.confirmedFactCount,
      );

      const serializedResult = JSON.stringify(result);

      expect(serializedResult).not.toContain('rawMealText');
      expect(serializedResult).not.toContain('providerToken');
    }
  });

  it('redacts and limits Ask Shadow memory facts', () => {
    const openAiKey = `sk-${'a'.repeat(24)}`;
    const bearerToken = `Bearer ${'b'.repeat(30)}`;

    const memoryFacts = [
      {
        text: `Email private@example.com, key ${openAiKey}, ${bearerToken}`,
        source: 'profile' as const,
        date: '2026-09-01T10:00:00.000Z',
      },
      {
        text: 'x'.repeat(AI_CONTEXT_LIMITS.memoryFactCharacters + 100),
        source: 'daily_summary' as const,
        date: '2026-09-02',
      },
      ...Array.from(
        {
          length: AI_CONTEXT_LIMITS.memoryFactCount + 5,
        },
        (_, index) => ({
          text: `Memory fact ${index + 1}`,
          source: 'check_in' as const,
          date: '2026-09-03',
        }),
      ),
    ];

    const input = {
      locale: '  ru-RU  ',
      primaryGoal: 'general_wellness' as const,
      constraints: [],
      memoryFacts,
      fullChat: ['Полная история не должна передаваться'],
    };

    const result = buildAskShadowAiContext(input);
    const serializedResult = JSON.stringify(result);

    expect(result.capability).toBe(AiCapability.AskShadow);
    expect(result.context.locale).toBe('ru-RU');
    expect(result.context.memoryFacts).toHaveLength(
      AI_CONTEXT_LIMITS.memoryFactCount,
    );
    expect(result.context.memoryFacts[0]?.date).toBe('2026-09-01');
    expect(
      result.context.memoryFacts.every(
        (fact) => fact.text.length <= AI_CONTEXT_LIMITS.memoryFactCharacters,
      ),
    ).toBe(true);

    expect(serializedResult).not.toContain('private@example.com');
    expect(serializedResult).not.toContain(openAiKey);
    expect(serializedResult).not.toContain(bearerToken);
    expect(serializedResult).not.toContain('fullChat');
    expect(serializedResult).toContain('[REDACTED]');
  });
});
