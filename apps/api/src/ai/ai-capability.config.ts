import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiCapability } from './ai-provider.contract';

export interface AiCapabilityConfiguration {
  model: string;
  maxInputCharacters: number;
  maxOutputTokens: number;
}

interface AiCapabilityDefinition {
  modelEnvironmentVariable: string;
  defaultModel: string;
  maxInputCharacters: number;
  maxOutputTokens: number;
}

const AI_CAPABILITY_DEFINITIONS: Record<AiCapability, AiCapabilityDefinition> =
  {
    [AiCapability.DailyPlan]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_DAILY_PLAN',
      defaultModel: 'gpt-5.6-terra',
      maxInputCharacters: 12_000,
      maxOutputTokens: 800,
    },
    [AiCapability.MealDraft]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_MEAL_DRAFT',
      defaultModel: 'gpt-5.6-luna',
      maxInputCharacters: 2_000,
      maxOutputTokens: 600,
    },
    [AiCapability.DailySummary]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_DAILY_SUMMARY',
      defaultModel: 'gpt-5.6-luna',
      maxInputCharacters: 8_000,
      maxOutputTokens: 250,
    },
    [AiCapability.AskShadow]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_ASK_SHADOW',
      defaultModel: 'gpt-5.6-terra',
      maxInputCharacters: 2_000,
      maxOutputTokens: 500,
    },
    [AiCapability.MemoryExtraction]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_MEMORY_EXTRACTION',
      defaultModel: 'gpt-5.6-luna',
      maxInputCharacters: 4_000,
      maxOutputTokens: 300,
    },
    [AiCapability.RecipeSuggestion]: {
      modelEnvironmentVariable: 'OPENAI_MODEL_RECIPE_SUGGESTION',
      defaultModel: 'gpt-5.6-terra',
      maxInputCharacters: 4_000,
      maxOutputTokens: 1_200,
    },
  };

@Injectable()
export class AiCapabilityConfig {
  constructor(private readonly configService: ConfigService) {}

  get(capability: AiCapability): AiCapabilityConfiguration {
    const definition = AI_CAPABILITY_DEFINITIONS[capability];

    return {
      model:
        this.configService.get<string>(definition.modelEnvironmentVariable) ??
        definition.defaultModel,
      maxInputCharacters: definition.maxInputCharacters,
      maxOutputTokens: definition.maxOutputTokens,
    };
  }
}
