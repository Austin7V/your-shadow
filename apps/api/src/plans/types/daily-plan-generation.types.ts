import type {
  AiHealthConstraintSource,
  AiLatestSummarySource,
} from '../../ai/context/ai-context.builder';
import type {
  DailyPlanCurrentDayFacts,
  DailyPlanPreviousDayFacts,
} from '../rules/daily-plan-rule.types';

export interface DailyPlanGenerationInput {
  readonly instant?: Date;
  readonly reportedSafetyCodes: readonly string[];
  readonly currentWeightKg: number | null;
  readonly constraints: readonly AiHealthConstraintSource[];
  readonly latestSummary: AiLatestSummarySource | null;
  readonly currentDay: DailyPlanCurrentDayFacts;
  readonly previousDay: DailyPlanPreviousDayFacts;
}
