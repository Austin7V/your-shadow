export const AI_PROVIDER = Symbol('AI_PROVIDER');

export enum AiCapability {
  DailyPlan = 'daily_plan',
  MealDraft = 'meal_draft',
  DailySummary = 'daily_summary',
  AskShadow = 'ask_shadow',
  MemoryExtraction = 'memory_extraction',
  RecipeSuggestion = 'recipe_suggestion',
}

export interface AiBaseGenerationRequest {
  capability: AiCapability;
  instructions: string;
  input: string;
}

export type AiTextGenerationRequest = AiBaseGenerationRequest;

export interface AiStructuredResponseFormat {
  name: string;
  schema: Record<string, unknown>;
}

export interface AiStructuredGenerationRequest extends AiBaseGenerationRequest {
  responseFormat: AiStructuredResponseFormat;
}

export interface AiUsageMetadata {
  provider: 'openai' | 'disabled' | 'fake';
  model: string;
  providerRequestId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  durationMs: number;
}

export interface AiGenerationResult<TOutput> {
  output: TOutput;
  usage: AiUsageMetadata;
}

export interface AiProvider {
  generateText(
    request: AiTextGenerationRequest,
  ): Promise<AiGenerationResult<string>>;

  generateStructured<TOutput>(
    request: AiStructuredGenerationRequest,
  ): Promise<AiGenerationResult<TOutput>>;
}
