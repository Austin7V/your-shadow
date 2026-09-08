import type {
  AiHealthConstraintSource,
  AiLatestSummarySource,
} from '../../ai/context/ai-context.builder';
import type { AiProviderErrorCode } from '../../ai/ai-provider.error';
import type { DailyPlan } from '../entities/daily-plan.entity';
import type {
  DailyPlanCurrentDayFacts,
  DailyPlanPreviousDayFacts,
} from '../rules/daily-plan-rule.types';

export enum DailyPlanGenerationMode {
  Ai = 'ai',
  Rules = 'rules',
  Fallback = 'fallback',
}

export interface DailyPlanGenerationInput {
  readonly instant?: Date;
  readonly reportedSafetyCodes: readonly string[];
  readonly currentWeightKg: number | null;
  readonly constraints: readonly AiHealthConstraintSource[];
  readonly latestSummary: AiLatestSummarySource | null;
  readonly currentDay: DailyPlanCurrentDayFacts;
  readonly previousDay: DailyPlanPreviousDayFacts;
}

export interface DailyPlanGenerationResult {
  readonly plan: DailyPlan;
  readonly mode: DailyPlanGenerationMode;
  readonly userMessage: string | null;
  readonly fallbackReason: AiProviderErrorCode | null;
}
