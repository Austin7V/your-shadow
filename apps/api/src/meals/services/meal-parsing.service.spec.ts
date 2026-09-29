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

  it('rethrows and safely records provider failures', async () => {
    const providerError = new AiProviderError(
      AiProviderErrorCode.RateLimited,
      'AI provider rate limit reached',
      true,
    );

    aiProvider.enqueueError(providerError);

    await expect(service.parse('A private meal description')).rejects.toBe(
      providerError,
    );

    expect(recordFailureSpy).toHaveBeenCalledWith(
      AiCapability.MealDraft,
      AiProviderErrorCode.RateLimited,
    );
    expect(recordSpy).not.toHaveBeenCalled();
  });
});
