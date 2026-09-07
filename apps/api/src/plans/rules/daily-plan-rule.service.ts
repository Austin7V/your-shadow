import { Injectable } from '@nestjs/common';

import {
  SafetyAction,
  type SafetyDecision,
} from '../../ai/safety/safety.types';
import {
  PlanItemSource,
  PlanItemStatus,
  type PlanItemPayload,
  type PlanItemType,
} from '../entities/plan-item.entity';
import {
  DAILY_PLAN_CHECK_IN_RULES,
  DAILY_PLAN_COMPLETED_WORKOUT_RULE,
  DAILY_PLAN_NUTRITION_RULES,
  DAILY_PLAN_PREVIOUS_DAY_WORKOUT_RULE,
  DAILY_PLAN_PROFILE_INCOMPLETE_WORKOUT_RULE,
  DAILY_PLAN_WORKOUT_GOAL_RULES,
  DAILY_PLAN_WORKOUT_SAFETY_RULES,
  type DailyPlanRuleContent,
  type DailyPlanWorkoutRule,
} from './daily-plan-rule.matrix';
import type {
  DailyPlanRuleInput,
  DailyPlanRuleItem,
} from './daily-plan-rule.types';

const SAFETY_BLOCKING_ACTIONS = new Set<SafetyAction>([
  SafetyAction.Block,
  SafetyAction.Stop,
  SafetyAction.Refer,
]);

@Injectable()
export class DailyPlanRuleService {
  createBasePlan(input: DailyPlanRuleInput): DailyPlanRuleItem[] {
    const safetyAction = this.resolveEffectiveSafetyAction(
      input.safetyDecision,
    );

    return [
      this.createNutritionItem(input),
      this.createWorkoutItem(input, safetyAction),
      this.createCheckInItem(input, safetyAction),
    ];
  }

  private createNutritionItem(input: DailyPlanRuleInput): DailyPlanRuleItem {
    const completed = input.currentDay.nutritionLogged;

    const rule = completed
      ? DAILY_PLAN_NUTRITION_RULES.completed
      : DAILY_PLAN_NUTRITION_RULES.pending;

    return this.createItem(
      'nutrition',
      0,
      completed ? PlanItemStatus.Completed : PlanItemStatus.Pending,
      rule,
    );
  }

  private createWorkoutItem(
    input: DailyPlanRuleInput,
    safetyAction: SafetyAction,
  ): DailyPlanRuleItem {
    if (SAFETY_BLOCKING_ACTIONS.has(safetyAction)) {
      const rule = DAILY_PLAN_WORKOUT_SAFETY_RULES[safetyAction];

      return this.createWorkoutItemFromRule(
        this.addSafetyMessages(rule, input.safetyDecision),
      );
    }

    if (!input.profileReady) {
      return this.createWorkoutItemFromRule(
        DAILY_PLAN_PROFILE_INCOMPLETE_WORKOUT_RULE,
      );
    }

    if (input.currentDay.workoutCompleted) {
      return this.createWorkoutItemFromRule(DAILY_PLAN_COMPLETED_WORKOUT_RULE);
    }

    if (safetyAction === SafetyAction.Limit) {
      return this.createWorkoutItemFromRule(
        this.addSafetyMessages(
          DAILY_PLAN_WORKOUT_SAFETY_RULES[SafetyAction.Limit],
          input.safetyDecision,
        ),
      );
    }

    if (input.previousDay.workoutCompleted === false) {
      return this.createWorkoutItemFromRule(
        DAILY_PLAN_PREVIOUS_DAY_WORKOUT_RULE,
      );
    }

    const goalRule = DAILY_PLAN_WORKOUT_GOAL_RULES[input.primaryGoal];

    return this.createItem('workout', 1, PlanItemStatus.Pending, goalRule);
  }

  private createCheckInItem(
    input: DailyPlanRuleInput,
    safetyAction: SafetyAction,
  ): DailyPlanRuleItem {
    if (safetyAction === SafetyAction.Refer) {
      return this.createItem(
        'check_in',
        2,
        PlanItemStatus.Pending,
        this.addSafetyMessages(
          DAILY_PLAN_CHECK_IN_RULES.refer,
          input.safetyDecision,
        ),
      );
    }

    if (safetyAction === SafetyAction.Stop) {
      return this.createItem(
        'check_in',
        2,
        PlanItemStatus.Pending,
        this.addSafetyMessages(
          DAILY_PLAN_CHECK_IN_RULES.stop,
          input.safetyDecision,
        ),
      );
    }

    if (!input.profileReady) {
      return this.createItem(
        'check_in',
        2,
        PlanItemStatus.Pending,
        DAILY_PLAN_CHECK_IN_RULES.profileIncomplete,
      );
    }

    const completed = input.currentDay.checkInCompleted;

    return this.createItem(
      'check_in',
      2,
      completed ? PlanItemStatus.Completed : PlanItemStatus.Pending,
      completed
        ? DAILY_PLAN_CHECK_IN_RULES.completed
        : DAILY_PLAN_CHECK_IN_RULES.pending,
    );
  }

  private createWorkoutItemFromRule(
    rule: DailyPlanWorkoutRule,
  ): DailyPlanRuleItem {
    return this.createItem('workout', 1, rule.status, rule);
  }

  private createItem(
    type: PlanItemType,
    order: number,
    status: PlanItemStatus,
    payload: PlanItemPayload,
  ): DailyPlanRuleItem {
    return {
      type,
      status,
      order,
      source: PlanItemSource.Rules,
      payload,
    };
  }

  private resolveEffectiveSafetyAction(decision: SafetyDecision): SafetyAction {
    if (decision.shouldGenerate) {
      return decision.action;
    }

    if (
      decision.action === SafetyAction.Stop ||
      decision.action === SafetyAction.Refer
    ) {
      return decision.action;
    }

    return SafetyAction.Block;
  }

  private addSafetyMessages<T extends DailyPlanRuleContent>(
    rule: T,
    decision: SafetyDecision,
  ): T {
    const safetyMessage = decision.userMessages.join(' ').trim();

    if (safetyMessage.length === 0) {
      return rule;
    }

    const description = `${rule.description} ${safetyMessage}`
      .slice(0, 500)
      .trim();

    return {
      ...rule,
      description,
    };
  }
}
