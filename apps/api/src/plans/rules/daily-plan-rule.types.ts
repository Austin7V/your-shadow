import type { SafetyDecision } from '../../ai/safety/safety.types';
import type { ProfileGoal } from '../../profiles/enums/profile-goal.enum';
import {
  PlanItemSource,
  PlanItemStatus,
  type PlanItemPayload,
  type PlanItemType,
} from '../entities/plan-item.entity';

export interface DailyPlanCurrentDayFacts {
  readonly nutritionLogged: boolean;
  readonly workoutCompleted: boolean;
  readonly checkInCompleted: boolean;
}

export interface DailyPlanPreviousDayFacts {
  readonly workoutCompleted: boolean | null;
}

export interface DailyPlanRuleInput {
  readonly primaryGoal: ProfileGoal;
  readonly profileReady: boolean;
  readonly safetyDecision: SafetyDecision;
  readonly currentDay: DailyPlanCurrentDayFacts;
  readonly previousDay: DailyPlanPreviousDayFacts;
}

export interface DailyPlanRuleItem {
  readonly type: PlanItemType;
  readonly status: PlanItemStatus;
  readonly order: number;
  readonly source: PlanItemSource.Rules;
  readonly payload: PlanItemPayload;
}
