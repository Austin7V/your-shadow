import { ConfigService } from '@nestjs/config';

import { AiCapabilityConfig } from './ai-capability.config';
import { AiCapability } from './ai-provider.contract';

describe('AiCapabilityConfig', () => {
  it('returns the approved default model and limits for every capability', () => {
    const capabilityConfig = new AiCapabilityConfig(new ConfigService());

    expect(capabilityConfig.get(AiCapability.DailyPlan)).toEqual({
      model: 'gpt-5.6-terra',
      maxInputCharacters: 12_000,
      maxOutputTokens: 800,
    });

    expect(capabilityConfig.get(AiCapability.MealDraft)).toEqual({
      model: 'gpt-5.6-luna',
      maxInputCharacters: 2_000,
      maxOutputTokens: 600,
    });

    expect(capabilityConfig.get(AiCapability.DailySummary)).toEqual({
      model: 'gpt-5.6-luna',
      maxInputCharacters: 8_000,
      maxOutputTokens: 250,
    });

    expect(capabilityConfig.get(AiCapability.AskShadow)).toEqual({
      model: 'gpt-5.6-terra',
      maxInputCharacters: 2_000,
      maxOutputTokens: 500,
    });

    expect(capabilityConfig.get(AiCapability.MemoryExtraction)).toEqual({
      model: 'gpt-5.6-luna',
      maxInputCharacters: 4_000,
      maxOutputTokens: 300,
    });

    expect(capabilityConfig.get(AiCapability.RecipeSuggestion)).toEqual({
      model: 'gpt-5.6-terra',
      maxInputCharacters: 4_000,
      maxOutputTokens: 1_200,
    });
  });

  it('uses a model from the environment when it is configured', () => {
    const capabilityConfig = new AiCapabilityConfig(
      new ConfigService({
        OPENAI_MODEL_DAILY_PLAN: 'custom-daily-plan-model',
      }),
    );

    expect(capabilityConfig.get(AiCapability.DailyPlan)).toEqual({
      model: 'custom-daily-plan-model',
      maxInputCharacters: 12_000,
      maxOutputTokens: 800,
    });
  });
});
