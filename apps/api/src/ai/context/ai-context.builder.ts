import type {
  HealthConstraintSeverity,
  HealthConstraintType,
  ProfileGoal,
} from '@your-shadow/contracts';

import { AiCapability } from '../ai-provider.contract';
import {
  AI_CONTEXT_LIMITS,
  type AiConfirmedFactContext,
  type AiConfirmedFactSource,
  type AiHealthConstraintContext,
  type AiLatestSummaryContext,
  type AiMemoryFactContext,
  type AiMemoryFactSource,
  type AskShadowAiContext,
  type DailyPlanAiContext,
  type DailySummaryAiContext,
  type MealDraftAiContext,
  type MemoryExtractionAiContext,
  type RecipeSuggestionAiContext,
} from './ai-context.types';

const REDACTED_VALUE = '[REDACTED]';

const SENSITIVE_TEXT_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+\b/gi,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
] as const;

export interface AiHealthConstraintSource {
  type: HealthConstraintType;
  severity: HealthConstraintSeverity;
  title: string;
  isActive: boolean;
}

export interface AiLatestSummarySource {
  text: string;
  date: string;
}

export interface AiMemoryFactSourceInput {
  text: string;
  source: AiMemoryFactSource;
  date: string;
}

export interface AiConfirmedFactSourceInput {
  text: string;
  source: AiConfirmedFactSource;
}

export interface DailyPlanAiContextInput {
  primaryGoal: ProfileGoal;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  constraints: readonly AiHealthConstraintSource[];
  latestSummary: AiLatestSummarySource | null;
}

export interface MealDraftAiContextInput {
  locale: string;
  primaryGoal: ProfileGoal;
  constraints: readonly AiHealthConstraintSource[];
}

export interface DailySummaryAiContextInput {
  localDate: string;
  confirmedFacts: readonly AiConfirmedFactSourceInput[];
}

export interface AskShadowAiContextInput {
  locale: string;
  primaryGoal: ProfileGoal;
  constraints: readonly AiHealthConstraintSource[];
  memoryFacts: readonly AiMemoryFactSourceInput[];
}

export interface MemoryExtractionAiContextInput {
  localDate: string;
  confirmedFacts: readonly AiConfirmedFactSourceInput[];
}

export interface RecipeSuggestionAiContextInput {
  locale: string;
  primaryGoal: ProfileGoal;
  constraints: readonly AiHealthConstraintSource[];
}

/**
 * Сначала удаляет чувствительные значения и только потом ограничивает длину.
 * Такой порядок не позволяет сохранить обрезанную часть секретного token.
 */
function sanitizeText(value: string, maxCharacters: number): string {
  const redactedValue = SENSITIVE_TEXT_PATTERNS.reduce(
    (currentValue, pattern) => currentValue.replace(pattern, REDACTED_VALUE),
    value.trim(),
  );

  return redactedValue.slice(0, maxCharacters);
}

function sanitizeDate(value: string): string {
  return value.trim().slice(0, 10);
}

function mapConstraints(
  constraints: readonly AiHealthConstraintSource[],
  type?: HealthConstraintType,
): AiHealthConstraintContext[] {
  return constraints
    .filter(
      (constraint) =>
        constraint.isActive && (type === undefined || constraint.type === type),
    )
    .map((constraint) => ({
      type: constraint.type,
      severity: constraint.severity,
      title: sanitizeText(
        constraint.title,
        AI_CONTEXT_LIMITS.constraintTitleCharacters,
      ),
    }))
    .filter((constraint) => constraint.title.length > 0)
    .slice(0, AI_CONTEXT_LIMITS.constraintCount);
}

function mapLatestSummary(
  summary: AiLatestSummarySource | null,
): AiLatestSummaryContext | null {
  if (summary === null) {
    return null;
  }

  const text = sanitizeText(summary.text, AI_CONTEXT_LIMITS.summaryCharacters);

  if (text.length === 0) {
    return null;
  }

  return {
    text,
    source: 'daily_summary',
    date: sanitizeDate(summary.date),
  };
}

function mapMemoryFacts(
  facts: readonly AiMemoryFactSourceInput[],
): AiMemoryFactContext[] {
  return facts
    .map((fact) => ({
      text: sanitizeText(fact.text, AI_CONTEXT_LIMITS.memoryFactCharacters),
      source: fact.source,
      date: sanitizeDate(fact.date),
    }))
    .filter((fact) => fact.text.length > 0)
    .slice(0, AI_CONTEXT_LIMITS.memoryFactCount);
}

function mapConfirmedFacts(
  facts: readonly AiConfirmedFactSourceInput[],
): AiConfirmedFactContext[] {
  return facts
    .map((fact) => ({
      text: sanitizeText(fact.text, AI_CONTEXT_LIMITS.confirmedFactCharacters),
      source: fact.source,
    }))
    .filter((fact) => fact.text.length > 0)
    .slice(0, AI_CONTEXT_LIMITS.confirmedFactCount);
}

export function buildDailyPlanAiContext(
  input: DailyPlanAiContextInput,
): DailyPlanAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.DailyPlan,
    context: {
      primaryGoal: input.primaryGoal,
      currentWeightKg: input.currentWeightKg,
      targetWeightKg: input.targetWeightKg,
      activeConstraints: mapConstraints(input.constraints),
      latestSummary: mapLatestSummary(input.latestSummary),
    },
  };
}

export function buildMealDraftAiContext(
  input: MealDraftAiContextInput,
): MealDraftAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.MealDraft,
    context: {
      locale: sanitizeText(input.locale, AI_CONTEXT_LIMITS.localeCharacters),
      primaryGoal: input.primaryGoal,
      allergies: mapConstraints(input.constraints, 'allergy'),
    },
  };
}

export function buildDailySummaryAiContext(
  input: DailySummaryAiContextInput,
): DailySummaryAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.DailySummary,
    context: {
      localDate: sanitizeDate(input.localDate),
      confirmedFacts: mapConfirmedFacts(input.confirmedFacts),
    },
  };
}

export function buildAskShadowAiContext(
  input: AskShadowAiContextInput,
): AskShadowAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.AskShadow,
    context: {
      locale: sanitizeText(input.locale, AI_CONTEXT_LIMITS.localeCharacters),
      primaryGoal: input.primaryGoal,
      activeConstraints: mapConstraints(input.constraints),
      memoryFacts: mapMemoryFacts(input.memoryFacts),
    },
  };
}

export function buildMemoryExtractionAiContext(
  input: MemoryExtractionAiContextInput,
): MemoryExtractionAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.MemoryExtraction,
    context: {
      localDate: sanitizeDate(input.localDate),
      confirmedFacts: mapConfirmedFacts(input.confirmedFacts),
    },
  };
}

export function buildRecipeSuggestionAiContext(
  input: RecipeSuggestionAiContextInput,
): RecipeSuggestionAiContext {
  return {
    contextVersion: 1,
    capability: AiCapability.RecipeSuggestion,
    context: {
      locale: sanitizeText(input.locale, AI_CONTEXT_LIMITS.localeCharacters),
      primaryGoal: input.primaryGoal,
      allergies: mapConstraints(input.constraints, 'allergy'),
    },
  };
}
