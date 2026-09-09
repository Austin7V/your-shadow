import type {
  TodayPlanItemResponse,
  TodayPlanNotGeneratedResponse,
  TodayPlanReadyResponse,
  TodayPlanResponse,
} from '@your-shadow/contracts';

import type { DailyPlan } from '../entities/daily-plan.entity';
import type { PlanItem } from '../entities/plan-item.entity';
import type { DailyPlanGenerationMode } from '../types/daily-plan-generation.types';

function toTodayPlanItemResponse(item: PlanItem): TodayPlanItemResponse {
  return {
    id: item.id,
    type: item.type,
    status: item.status,
    order: item.order,
    source: item.source,
    payload: {
      title: item.payload.title,
      description: item.payload.description,
      explanation: item.payload.explanation,
    },
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function toTodayPlanResponse(plan: DailyPlan): TodayPlanResponse {
  return {
    id: plan.id,
    localDate: plan.localDate,
    status: plan.status,
    schemaVersion: plan.schemaVersion,
    summary: plan.summary,
    items: [...plan.items]
      .sort((firstItem, secondItem) => firstItem.order - secondItem.order)
      .map(toTodayPlanItemResponse),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export function toTodayPlanNotGeneratedResponse(
  localDate: string,
): TodayPlanNotGeneratedResponse {
  return {
    state: 'not_generated',
    localDate,
    plan: null,
    generation: null,
  };
}

export function toTodayPlanReadyResponse(
  plan: DailyPlan,
  mode: DailyPlanGenerationMode,
  userMessage: string | null,
): TodayPlanReadyResponse {
  return {
    state: 'ready',
    localDate: plan.localDate,
    plan: toTodayPlanResponse(plan),
    generation: {
      mode,
      userMessage,
    },
  };
}

export function toUpdatedPlanItemResponse(
  item: PlanItem,
): TodayPlanItemResponse {
  return toTodayPlanItemResponse(item);
}
