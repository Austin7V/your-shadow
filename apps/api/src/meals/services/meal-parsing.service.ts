import { Inject, Injectable } from '@nestjs/common';
import {
  AiSchemaValidationError,
  MEAL_DRAFT_RESPONSE_FORMAT,
  mealDraftOutputSchema,
  validateAiOutput,
  type ParseMealResponse,
} from '@your-shadow/contracts';

import {
  AI_PROVIDER,
  AiCapability,
  type AiProvider,
} from '../../ai/ai-provider.contract';
import {
  AiProviderError,
  AiProviderErrorCode,
} from '../../ai/ai-provider.error';
import { AiUsageRecorderService } from '../../ai/usage/ai-usage-recorder.service';
import { buildMealParsingPrompt } from '../prompts/meal-parsing.prompt';
import { MEAL_NUTRITION_VALIDATION_LIMITS } from '../validation/meal-nutrition-validation.constants';
import {
  MealNutritionValidationAction,
  MealNutritionValidationCode,
} from '../validation/meal-nutrition-validation.types';
import { MealNutritionValidatorService } from '../validation/meal-nutrition-validator.service';

@Injectable()
export class MealParsingService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AiProvider,
    private readonly aiUsageRecorderService: AiUsageRecorderService,
    private readonly mealNutritionValidatorService: MealNutritionValidatorService,
  ) {}

  async parse(originalText: string): Promise<ParseMealResponse> {
    const prompt = buildMealParsingPrompt(originalText);

    try {
      const generationResult =
        await this.aiProvider.generateStructured<unknown>({
          capability: AiCapability.MealDraft,
          instructions: prompt.instructions,
          input: prompt.input,
          responseFormat: MEAL_DRAFT_RESPONSE_FORMAT,
        });

      this.aiUsageRecorderService.record(
        AiCapability.MealDraft,
        generationResult.usage,
      );

      const parsedDraft = validateAiOutput(
        mealDraftOutputSchema,
        generationResult.output,
      );

      const hasLowConfidence =
        parsedDraft.confidence <
          MEAL_NUTRITION_VALIDATION_LIMITS.lowConfidenceThreshold ||
        parsedDraft.foods.some(
          (food) =>
            food.confidence <
            MEAL_NUTRITION_VALIDATION_LIMITS.lowConfidenceThreshold,
        );

      const draft =
        hasLowConfidence &&
        (!parsedDraft.clarification.needed ||
          !parsedDraft.clarification.question)
          ? {
              ...parsedDraft,
              clarification: {
                needed: true,
                question: 'About how much of the meal did you eat?',
              },
            }
          : parsedDraft;

      const validationResult =
        this.mealNutritionValidatorService.validate(draft);

      if (validationResult.action === MealNutritionValidationAction.Correct) {
        const failureCode =
          validationResult.reasons[0]?.code ??
          MealNutritionValidationCode.InvalidStructure;

        throw new AiProviderError(
          AiProviderErrorCode.InvalidResponse,
          `AI meal draft failed nutrition validation: ${failureCode}`,
          true,
        );
      }

      return draft;
    } catch (error) {
      this.aiUsageRecorderService.recordFailure(
        AiCapability.MealDraft,
        this.resolveFailureCode(error),
      );

      if (error instanceof AiProviderError) {
        switch (error.code) {
          case AiProviderErrorCode.Disabled:
          case AiProviderErrorCode.Timeout:
          case AiProviderErrorCode.RateLimited:
          case AiProviderErrorCode.Unavailable:
            return {
              status: 'manual_entry_required',
              reason: 'ai_unavailable',
              originalText,
              nutrition: {
                caloriesKcal: null,
                proteinGrams: null,
                fatGrams: null,
                carbohydratesGrams: null,
              },
            };
        }
      }

      throw error;
    }
  }

  private resolveFailureCode(error: unknown): string {
    if (error instanceof AiProviderError) {
      return error.code;
    }

    if (error instanceof AiSchemaValidationError) {
      return error.code;
    }

    return AiProviderErrorCode.Unknown;
  }
}
