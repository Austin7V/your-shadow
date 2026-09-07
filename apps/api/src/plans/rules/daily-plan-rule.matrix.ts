import { SafetyAction } from '../../ai/safety/safety.types';
import { ProfileGoal } from '../../profiles/enums/profile-goal.enum';
import { PlanItemStatus } from '../entities/plan-item.entity';

export interface DailyPlanRuleContent {
  readonly title: string;
  readonly description: string;
  readonly explanation: string | null;
}

export interface DailyPlanWorkoutRule extends DailyPlanRuleContent {
  readonly status: PlanItemStatus;
}

export const DAILY_PLAN_NUTRITION_RULES = {
  pending: {
    title: 'Log your next meal',
    description:
      'Record your next meal using the food that is available to you today.',
    explanation:
      'A meal record keeps the daily plan grounded in confirmed facts.',
  },
  completed: {
    title: 'Nutrition recorded',
    description: 'A nutrition entry has already been recorded today.',
    explanation: null,
  },
} as const satisfies Record<'pending' | 'completed', DailyPlanRuleContent>;

export const DAILY_PLAN_CHECK_IN_RULES = {
  pending: {
    title: "Complete today's check-in",
    description:
      'Record how you feel and note any change that could affect today’s plan.',
    explanation: 'The check-in helps the next plan use current information.',
  },
  completed: {
    title: 'Daily check-in completed',
    description: 'A check-in has already been recorded today.',
    explanation: null,
  },
  profileIncomplete: {
    title: 'Complete your profile',
    description:
      'Complete the required profile information before following a personalized workout.',
    explanation: 'A complete profile is required for safer personalization.',
  },
  stop: {
    title: 'Review the safety warning',
    description:
      'Do not resume physical activity until the reported safety concern has been addressed.',
    explanation:
      'Safety instructions take priority over the normal daily plan.',
  },
  refer: {
    title: 'Follow the urgent safety guidance',
    description: 'Follow the urgent guidance shown for the reported symptom.',
    explanation:
      'Urgent safety guidance takes priority over every planned activity.',
  },
} as const satisfies Record<
  'pending' | 'completed' | 'profileIncomplete' | 'stop' | 'refer',
  DailyPlanRuleContent
>;

export const DAILY_PLAN_WORKOUT_GOAL_RULES = {
  [ProfileGoal.LOSE_WEIGHT]: {
    title: 'Take a comfortable walk',
    description:
      'Choose a comfortable walking session that fits your current energy and schedule.',
    explanation: 'Regular manageable movement supports the selected goal.',
  },
  [ProfileGoal.GAIN_WEIGHT]: {
    title: 'Complete a short strength session',
    description:
      'Choose a manageable strength session using exercises available to you.',
    explanation: 'Consistent strength activity supports the selected goal.',
  },
  [ProfileGoal.MAINTAIN_WEIGHT]: {
    title: 'Complete balanced movement',
    description:
      'Choose a manageable activity that helps maintain your current routine.',
    explanation: 'Regular movement supports weight maintenance.',
  },
  [ProfileGoal.IMPROVE_FITNESS]: {
    title: 'Complete a fitness session',
    description:
      'Choose a manageable activity that supports your current fitness level.',
    explanation: 'A consistent session supports gradual fitness improvement.',
  },
  [ProfileGoal.GENERAL_WELLNESS]: {
    title: 'Take a movement break',
    description: 'Choose a comfortable form of movement that fits your day.',
    explanation: 'Regular movement supports general wellbeing.',
  },
} as const satisfies Record<ProfileGoal, DailyPlanRuleContent>;

export const DAILY_PLAN_WORKOUT_SAFETY_RULES = {
  [SafetyAction.Allow]: {
    status: PlanItemStatus.Pending,
    title: 'Complete planned movement',
    description: 'Choose a manageable form of movement that fits your day.',
    explanation: 'The current safety information allows normal planning.',
  },
  [SafetyAction.Limit]: {
    status: PlanItemStatus.Pending,
    title: 'Choose gentle movement',
    description:
      'Keep movement light and within the limits recorded in your profile.',
    explanation:
      'The workout intensity was reduced by the current safety decision.',
  },
  [SafetyAction.Block]: {
    status: PlanItemStatus.Blocked,
    title: 'Workout paused',
    description:
      'Do not start a normal workout while the current restriction is active.',
    explanation: 'The current safety decision blocks normal workout planning.',
  },
  [SafetyAction.Stop]: {
    status: PlanItemStatus.Blocked,
    title: 'Stop physical activity',
    description:
      'Stop the activity and do not continue through the reported concern.',
    explanation:
      'The current safety decision requires physical activity to stop.',
  },
  [SafetyAction.Refer]: {
    status: PlanItemStatus.Blocked,
    title: 'Seek urgent medical help',
    description:
      'Do not start or continue physical activity. Follow the urgent safety guidance.',
    explanation:
      'Urgent safety guidance takes priority over the daily workout.',
  },
} satisfies Record<SafetyAction, DailyPlanWorkoutRule>;

export const DAILY_PLAN_COMPLETED_WORKOUT_RULE = {
  status: PlanItemStatus.Completed,
  title: 'Workout completed',
  description: 'A workout or movement entry has already been recorded today.',
  explanation: null,
} as const satisfies DailyPlanWorkoutRule;

export const DAILY_PLAN_PROFILE_INCOMPLETE_WORKOUT_RULE = {
  status: PlanItemStatus.Blocked,
  title: 'Workout unavailable',
  description:
    'Complete the required profile information before receiving a workout task.',
  explanation: 'A complete profile is required for safer workout planning.',
} as const satisfies DailyPlanWorkoutRule;

export const DAILY_PLAN_PREVIOUS_DAY_WORKOUT_RULE = {
  status: PlanItemStatus.Pending,
  title: 'Restart with manageable movement',
  description:
    'Choose comfortable movement today without copying yesterday’s unfinished task.',
  explanation:
    'The previous result adjusts today’s baseline but is not carried forward as another task.',
} as const satisfies DailyPlanWorkoutRule;
