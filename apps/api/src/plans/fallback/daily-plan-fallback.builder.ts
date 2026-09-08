import { Injectable } from '@nestjs/common';
import { AiSchemaValidationError } from '@your-shadow/contracts';

import {
  AiProviderError,
  AiProviderErrorCode,
} from '../../ai/ai-provider.error';
import {
  PlanItemSource,
  type PlanItemPayload,
  type PlanItemStatus,
  type PlanItemType,
} from '../entities/plan-item.entity';
import type { DailyPlanRuleItem } from '../rules/daily-plan-rule.types';

export const DAILY_PLAN_FALLBACK_USER_MESSAGE =
  'AI personalization is temporarily unavailable, so your plan was created with safe built-in guidance.';

export interface DailyPlanFallbackItem {
  readonly type: PlanItemType;
  readonly status: PlanItemStatus;
  readonly order: number;
  readonly source: PlanItemSource.Fallback;
  readonly payload: PlanItemPayload;
}

export interface DailyPlanFallback {
  readonly reason: AiProviderErrorCode;
  readonly userMessage: typeof DAILY_PLAN_FALLBACK_USER_MESSAGE;
  readonly items: readonly DailyPlanFallbackItem[];
}

export function resolveDailyPlanFallbackReason(
  error: unknown,
): AiProviderErrorCode | null {
  if (error instanceof AiProviderError) {
    return error.code;
  }

  if (error instanceof AiSchemaValidationError) {
    return AiProviderErrorCode.InvalidResponse;
  }

  return null;
}

@Injectable()
export class DailyPlanFallbackBuilder {
  create(
    basePlan: readonly DailyPlanRuleItem[],
    reason: AiProviderErrorCode,
  ): DailyPlanFallback {
    return {
      reason,
      userMessage: DAILY_PLAN_FALLBACK_USER_MESSAGE,
      items: basePlan.map((item) => ({
        type: item.type,
        status: item.status,
        order: item.order,
        source: PlanItemSource.Fallback,
        payload: {
          ...item.payload,
        },
      })),
    };
  }
}
