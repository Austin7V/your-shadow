import { SafetyRuleService } from '../../ai/safety/safety-rule.service';
import { SafetyCode, type SafetyDecision } from '../../ai/safety/safety.types';
import { ProfileGoal } from '../../profiles/enums/profile-goal.enum';
import { PlanItemSource, PlanItemStatus } from '../entities/plan-item.entity';
import { DailyPlanRuleService } from './daily-plan-rule.service';
import type { DailyPlanRuleInput } from './daily-plan-rule.types';

describe('DailyPlanRuleService', () => {
  let service: DailyPlanRuleService;
  let safetyRuleService: SafetyRuleService;

  beforeEach(() => {
    service = new DailyPlanRuleService();
    safetyRuleService = new SafetyRuleService();
  });

  function createInput(
    overrides: Partial<DailyPlanRuleInput> = {},
  ): DailyPlanRuleInput {
    const safetyDecision: SafetyDecision =
      overrides.safetyDecision ??
      safetyRuleService.evaluateBeforeGeneration([]);

    return {
      primaryGoal: overrides.primaryGoal ?? ProfileGoal.LOSE_WEIGHT,
      profileReady: overrides.profileReady ?? true,
      safetyDecision,
      currentDay: overrides.currentDay ?? {
        nutritionLogged: false,
        workoutCompleted: false,
        checkInCompleted: false,
      },
      previousDay: overrides.previousDay ?? {
        workoutCompleted: null,
      },
    };
  }

  it('creates the same three baseline items for the same facts', () => {
    const input = createInput();

    const firstPlan = service.createBasePlan(input);
    const secondPlan = service.createBasePlan(input);

    expect(secondPlan).toEqual(firstPlan);
    expect(firstPlan).toHaveLength(3);

    expect(
      firstPlan.map((item) => ({
        type: item.type,
        order: item.order,
        status: item.status,
        source: item.source,
      })),
    ).toEqual([
      {
        type: 'nutrition',
        order: 0,
        status: PlanItemStatus.Pending,
        source: PlanItemSource.Rules,
      },
      {
        type: 'workout',
        order: 1,
        status: PlanItemStatus.Pending,
        source: PlanItemSource.Rules,
      },
      {
        type: 'check_in',
        order: 2,
        status: PlanItemStatus.Pending,
        source: PlanItemSource.Rules,
      },
    ]);

    expect(firstPlan[1]?.payload.title).toBe('Take a comfortable walk');
  });

  it('uses the selected profile goal', () => {
    const items = service.createBasePlan(
      createInput({
        primaryGoal: ProfileGoal.GAIN_WEIGHT,
      }),
    );

    expect(items[1]?.payload.title).toBe('Complete a short strength session');
  });

  it('uses current-day and previous-day facts without copying tasks', () => {
    const items = service.createBasePlan(
      createInput({
        currentDay: {
          nutritionLogged: true,
          workoutCompleted: false,
          checkInCompleted: true,
        },
        previousDay: {
          workoutCompleted: false,
        },
      }),
    );

    expect(items[0]?.status).toBe(PlanItemStatus.Completed);
    expect(items[1]?.payload.title).toBe('Restart with manageable movement');
    expect(items[2]?.status).toBe(PlanItemStatus.Completed);
    expect(items).toHaveLength(3);
  });

  it('limits workout intensity for an active health constraint', () => {
    const safetyDecision = safetyRuleService.evaluateBeforeGeneration([
      SafetyCode.ActiveHealthConstraint,
    ]);

    const items = service.createBasePlan(
      createInput({
        safetyDecision,
      }),
    );

    expect(items[1]?.status).toBe(PlanItemStatus.Pending);
    expect(items[1]?.payload.title).toBe('Choose gentle movement');
    expect(items[1]?.payload.description).toContain(
      'active health constraints',
    );
  });

  it('blocks the workout instead of adding a normal task', () => {
    const safetyDecision = safetyRuleService.evaluateBeforeGeneration([
      SafetyCode.ActiveMedicalRestriction,
    ]);

    const items = service.createBasePlan(
      createInput({
        safetyDecision,
      }),
    );

    expect(items[1]?.status).toBe(PlanItemStatus.Blocked);
    expect(items[1]?.payload.title).toBe('Workout paused');
    expect(items[1]?.payload.description).toContain('medical restriction');
  });

  it('prioritizes urgent safety guidance', () => {
    const safetyDecision = safetyRuleService.evaluateBeforeGeneration([
      SafetyCode.ChestPain,
    ]);

    const items = service.createBasePlan(
      createInput({
        safetyDecision,
      }),
    );

    expect(items[1]?.status).toBe(PlanItemStatus.Blocked);
    expect(items[1]?.payload.title).toBe('Seek urgent medical help');
    expect(items[2]?.payload.title).toBe('Follow the urgent safety guidance');
    expect(items[2]?.payload.description).toContain('urgent medical help');
  });

  it('blocks workout planning until the profile is ready', () => {
    const items = service.createBasePlan(
      createInput({
        profileReady: false,
      }),
    );

    expect(items[1]?.status).toBe(PlanItemStatus.Blocked);
    expect(items[1]?.payload.title).toBe('Workout unavailable');
    expect(items[2]?.payload.title).toBe('Complete your profile');
  });
});
