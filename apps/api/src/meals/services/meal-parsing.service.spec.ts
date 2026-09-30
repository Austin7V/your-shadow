import { MEAL_DRAFT_RESPONSE_FORMAT } from '@your-shadow/contracts';

import { AiCapability } from '../../ai/ai-provider.contract';
import {
  AiProviderError,
  AiProviderErrorCode,
} from '../../ai/ai-provider.error';
import { FakeAiProvider } from '../../ai/testing/fake-ai.provider';
import { AiUsageRecorderService } from '../../ai/usage/ai-usage-recorder.service';
import { MEAL_PARSING_INSTRUCTIONS } from '../prompts/meal-parsing.prompt';
import {
  AMBIGUOUS_PORTION_MEAL_FIXTURE,
  EXPLICIT_PORTIONS_MEAL_FIXTURE,
} from '../testing/meal-parsing.fixtures';
import { MealNutritionValidatorService } from '../validation/meal-nutrition-validator.service';
import { MealParsingService } from './meal-parsing.service';

describe('MealParsingService', () => {
  let aiProvider: FakeAiProvider;
  let aiUsageRecorderService: AiUsageRecorderService;
  let recordSpy: jest.SpiedFunction<AiUsageRecorderService['record']>;
  let recordFailureSpy: jest.SpiedFunction<
    AiUsageRecorderService['recordFailure']
  >;
  let service: MealParsingService;

  beforeEach(() => {
    aiProvider = new FakeAiProvider();
    aiUsageRecorderService = new AiUsageRecorderService();

    recordSpy = jest
      .spyOn(aiUsageRecorderService, 'record')
      .mockImplementation(() => undefined);
    recordFailureSpy = jest
      .spyOn(aiUsageRecorderService, 'recordFailure')
      .mockImplementation(() => undefined);

    service = new MealParsingService(
      aiProvider,
      aiUsageRecorderService,
      new MealNutritionValidatorService(),
    );
  });

  it('returns a typed non-persisted meal draft', async () => {
    aiProvider.enqueueResult(EXPLICIT_PORTIONS_MEAL_FIXTURE.output);

    await expect(
      service.parse(EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText),
    ).resolves.toEqual(EXPLICIT_PORTIONS_MEAL_FIXTURE.output);

    expect(aiProvider.structuredRequests).toEqual([
      {
        capability: AiCapability.MealDraft,
        instructions: MEAL_PARSING_INSTRUCTIONS,
        input: JSON.stringify({
          originalText: EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText,
        }),
        responseFormat: MEAL_DRAFT_RESPONSE_FORMAT,
      },
    ]);

    expect(recordSpy).toHaveBeenCalledWith(AiCapability.MealDraft, {
      provider: 'fake',
      model: 'fake-model',
      durationMs: 0,
    });
    expect(recordFailureSpy).not.toHaveBeenCalled();
  });

  it('returns a valid draft that requires clarification', async () => {
    aiProvider.enqueueResult(AMBIGUOUS_PORTION_MEAL_FIXTURE.output);

    await expect(
      service.parse(AMBIGUOUS_PORTION_MEAL_FIXTURE.originalText),
    ).resolves.toEqual(AMBIGUOUS_PORTION_MEAL_FIXTURE.output);
  });

  it('adds one question when a low-confidence draft omits clarification', async () => {
    aiProvider.enqueueResult({
      ...AMBIGUOUS_PORTION_MEAL_FIXTURE.output,
      clarification: {
        needed: false,
        question: null,
      },
    });

    await expect(
      service.parse(AMBIGUOUS_PORTION_MEAL_FIXTURE.originalText),
    ).resolves.toEqual({
      ...AMBIGUOUS_PORTION_MEAL_FIXTURE.output,
      clarification: {
        needed: true,
        question: 'About how much of the meal did you eat?',
      },
    });
  });

  it('rejects nutrition data that requires correction', async () => {
    const inconsistentOutput = {
      ...EXPLICIT_PORTIONS_MEAL_FIXTURE.output,
      totals: {
        ...EXPLICIT_PORTIONS_MEAL_FIXTURE.output.totals,
        caloriesKcal: 5_000,
      },
    };

    aiProvider.enqueueResult(inconsistentOutput);

    await expect(
      service.parse(EXPLICIT_PORTIONS_MEAL_FIXTURE.originalText),
    ).rejects.toMatchObject({
      name: AiProviderError.name,
      code: AiProviderErrorCode.InvalidResponse,
      retryable: true,
    });

    expect(recordFailureSpy).toHaveBeenCalledWith(
      AiCapability.MealDraft,
      AiProviderErrorCode.InvalidResponse,
    );
  });

  it.each([
    AiProviderErrorCode.Disabled,
    AiProviderErrorCode.Timeout,
    AiProviderErrorCode.RateLimited,
    AiProviderErrorCode.Unavailable,
  ])('offers manual entry for provider failure %s', async (code) => {
    aiProvider.enqueueError(
      new AiProviderError(code, 'Private provider details', true),
    );

    await expect(service.parse('A private meal description')).resolves.toEqual({
      status: 'manual_entry_required',
      reason: 'ai_unavailable',
      originalText: 'A private meal description',
      nutrition: {
        caloriesKcal: null,
        proteinGrams: null,
        fatGrams: null,
        carbohydratesGrams: null,
      },
    });

    expect(recordFailureSpy).toHaveBeenCalledWith(AiCapability.MealDraft, code);
    expect(recordSpy).not.toHaveBeenCalled();
  });
});
