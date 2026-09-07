import type {
  HealthConstraintSeverity,
  HealthConstraintType,
  ProfileGoal,
} from '@your-shadow/contracts';

import { AiCapability } from '../ai-provider.contract';

export const AI_CONTEXT_VERSION = 1 as const;

export const AI_CONTEXT_LIMITS = {
  localeCharacters: 35,
  constraintCount: 10,
  constraintTitleCharacters: 120,
  memoryFactCount: 10,
  memoryFactCharacters: 300,
  confirmedFactCount: 20,
  confirmedFactCharacters: 200,
  summaryCharacters: 500,
} as const;

export const AI_MEMORY_FACT_SOURCES = [
  'profile',
  'daily_summary',
  'meal',
  'workout',
  'check_in',
  'safety_flag',
] as const;

export type AiMemoryFactSource = (typeof AI_MEMORY_FACT_SOURCES)[number];

export const AI_CONFIRMED_FACT_SOURCES = [
  'plan',
  'meal',
  'workout',
  'check_in',
] as const;

export type AiConfirmedFactSource = (typeof AI_CONFIRMED_FACT_SOURCES)[number];

export interface AiContextEnvelope<TCapability extends AiCapability, TContext> {
  contextVersion: typeof AI_CONTEXT_VERSION;
  capability: TCapability;
  context: TContext;
}

export interface AiHealthConstraintContext {
  type: HealthConstraintType;
  severity: HealthConstraintSeverity;
  title: string;
}

export interface AiMemoryFactContext {
  text: string;
  source: AiMemoryFactSource;
  date: string;
}

export interface AiConfirmedFactContext {
  text: string;
  source: AiConfirmedFactSource;
}

export interface AiLatestSummaryContext {
  text: string;
  source: 'daily_summary';
  date: string;
}

export type DailyPlanAiContext = AiContextEnvelope<
  AiCapability.DailyPlan,
  {
    primaryGoal: ProfileGoal;
    currentWeightKg: number | null;
    targetWeightKg: number | null;
    activeConstraints: AiHealthConstraintContext[];
    latestSummary: AiLatestSummaryContext | null;
  }
>;

export type MealDraftAiContext = AiContextEnvelope<
  AiCapability.MealDraft,
  {
    locale: string;
    primaryGoal: ProfileGoal;
    allergies: AiHealthConstraintContext[];
  }
>;

export type DailySummaryAiContext = AiContextEnvelope<
  AiCapability.DailySummary,
  {
    localDate: string;
    confirmedFacts: AiConfirmedFactContext[];
  }
>;

export type AskShadowAiContext = AiContextEnvelope<
  AiCapability.AskShadow,
  {
    locale: string;
    primaryGoal: ProfileGoal;
    activeConstraints: AiHealthConstraintContext[];
    memoryFacts: AiMemoryFactContext[];
  }
>;

export type MemoryExtractionAiContext = AiContextEnvelope<
  AiCapability.MemoryExtraction,
  {
    localDate: string;
    confirmedFacts: AiConfirmedFactContext[];
  }
>;

export type RecipeSuggestionAiContext = AiContextEnvelope<
  AiCapability.RecipeSuggestion,
  {
    locale: string;
    primaryGoal: ProfileGoal;
    allergies: AiHealthConstraintContext[];
  }
>;

export type AnyAiContext =
  | DailyPlanAiContext
  | MealDraftAiContext
  | DailySummaryAiContext
  | AskShadowAiContext
  | MemoryExtractionAiContext
  | RecipeSuggestionAiContext;
