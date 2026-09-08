import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AI_OUTPUT_SCHEMA_VERSIONS,
  DAILY_PLAN_ITEM_TYPES,
  DAILY_PLAN_RESPONSE_FORMAT,
  dailyPlanOutputSchema,
  validateAiOutput,
  type DailyPlanOutput,
} from '@your-shadow/contracts';
import { DataSource, Repository } from 'typeorm';

import {
  buildDailyPlanAiContext,
  type DailyPlanAiContextInput,
} from '../../ai/context/ai-context.builder';
import {
  AI_PROVIDER,
  AiCapability,
  type AiProvider,
} from '../../ai/ai-provider.contract';
import {
  AiProviderError,
  AiProviderErrorCode,
} from '../../ai/ai-provider.error';
import {
  SafetyAction,
  SafetyCode,
  type SafetyDecision,
} from '../../ai/safety/safety.types';
import { SafetyRuleService } from '../../ai/safety/safety-rule.service';
import { AiUsageRecorderService } from '../../ai/usage/ai-usage-recorder.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { User } from '../../users/entities/user.entity';
import { DailyPlan, DailyPlanStatus } from '../entities/daily-plan.entity';
import {
  PlanItem,
  PlanItemSource,
  PlanItemStatus,
  type PlanItemPayload,
  type PlanItemType,
} from '../entities/plan-item.entity';
import { DailyPlanRuleService } from '../rules/daily-plan-rule.service';
import type { DailyPlanRuleItem } from '../rules/daily-plan-rule.types';
import type { DailyPlanGenerationInput } from '../types/daily-plan-generation.types';
import { LocalDateService } from './local-date.service';

const DAILY_PLAN_GENERATION_INSTRUCTIONS = [
  'Return exactly three daily plan items.',
  'Use nutrition, workout, and check_in exactly once.',
  'Set source to ai for every returned item.',
  'Rewrite only actions allowed by the provided deterministic plan.',
  'Do not change completed, blocked, stopped, or referral decisions.',
  'Do not add diagnoses, medication advice, or unsupported medical claims.',
  'Return only the structured response that matches the supplied schema.',
].join(' ');

interface DailyPlanDomainItem {
  readonly type: PlanItemType;
  readonly status: PlanItemStatus;
  readonly order: number;
  readonly source: PlanItemSource;
  readonly payload: PlanItemPayload;
}

@Injectable()
export class DailyPlanGenerationService {
  constructor(
    @InjectRepository(DailyPlan)
    private readonly dailyPlansRepository: Repository<DailyPlan>,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AiProvider,
    private readonly dataSource: DataSource,
    private readonly profilesService: ProfilesService,
    private readonly localDateService: LocalDateService,
    private readonly safetyRuleService: SafetyRuleService,
    private readonly dailyPlanRuleService: DailyPlanRuleService,
    private readonly aiUsageRecorderService: AiUsageRecorderService,
  ) {}

  async generateForUser(
    userId: string,
    input: DailyPlanGenerationInput,
  ): Promise<DailyPlan> {
    const profile = await this.profilesService.getProfile(userId);

    const localDate = this.localDateService.resolveLocalDate(
      profile.timezone,
      input.instant ?? new Date(),
    );

    const existingPlan = await this.findExistingPlan(userId, localDate);

    if (existingPlan !== null) {
      return existingPlan;
    }

    const safetyDecision = this.safetyRuleService.evaluateBeforeGeneration(
      this.resolveSafetyCodes(input),
    );

    const basePlan = this.dailyPlanRuleService.createBasePlan({
      primaryGoal: profile.primaryGoal,
      profileReady: profile.onboardingCompletedAt !== null,
      safetyDecision,
      currentDay: input.currentDay,
      previousDay: input.previousDay,
    });

    let schemaVersion = AI_OUTPUT_SCHEMA_VERSIONS.dailyPlan;
    let domainItems: DailyPlanDomainItem[] = basePlan;

    if (safetyDecision.shouldGenerate) {
      const contextInput: DailyPlanAiContextInput = {
        primaryGoal: profile.primaryGoal,
        currentWeightKg: input.currentWeightKg,
        targetWeightKg: profile.targetWeightKg,
        constraints: input.constraints,
        latestSummary: input.latestSummary,
      };

      const context = buildDailyPlanAiContext(contextInput);

      const generationResult =
        await this.aiProvider.generateStructured<unknown>({
          capability: AiCapability.DailyPlan,
          instructions: DAILY_PLAN_GENERATION_INSTRUCTIONS,
          input: JSON.stringify({
            localDate,
            context,
            deterministicPlan: basePlan,
          }),
          responseFormat: DAILY_PLAN_RESPONSE_FORMAT,
        });

      this.aiUsageRecorderService.record(
        AiCapability.DailyPlan,
        generationResult.usage,
      );

      const validatedOutput = validateAiOutput(
        dailyPlanOutputSchema,
        generationResult.output,
      );

      schemaVersion = validatedOutput.schemaVersion;
      domainItems = this.mergeValidatedOutput(
        validatedOutput,
        basePlan,
        safetyDecision,
      );
    }

    return this.persistPlan(userId, localDate, schemaVersion, domainItems);
  }

  private resolveSafetyCodes(
    input: DailyPlanGenerationInput,
  ): readonly string[] {
    const safetyCodes = [...input.reportedSafetyCodes];

    if (input.constraints.some((constraint) => constraint.isActive)) {
      safetyCodes.push(SafetyCode.ActiveHealthConstraint);
    }

    if (
      input.constraints.some(
        (constraint) =>
          constraint.isActive && constraint.type === 'medical_restriction',
      )
    ) {
      safetyCodes.push(SafetyCode.ActiveMedicalRestriction);
    }

    return safetyCodes;
  }

  private mergeValidatedOutput(
    output: DailyPlanOutput,
    basePlan: readonly DailyPlanRuleItem[],
    safetyDecision: SafetyDecision,
  ): DailyPlanDomainItem[] {
    const generatedItems = new Map<
      PlanItemType,
      DailyPlanOutput['items'][number]
    >();

    for (const item of output.items) {
      if (generatedItems.has(item.type)) {
        throw this.createInvalidResponseError(
          'AI daily plan contains duplicate item types',
        );
      }

      generatedItems.set(item.type, item);
    }

    if (
      output.items.length !== DAILY_PLAN_ITEM_TYPES.length ||
      generatedItems.size !== DAILY_PLAN_ITEM_TYPES.length
    ) {
      throw this.createInvalidResponseError(
        'AI daily plan must contain every required item type exactly once',
      );
    }

    return basePlan.map((ruleItem) => {
      const generatedItem = generatedItems.get(ruleItem.type);

      if (generatedItem === undefined) {
        throw this.createInvalidResponseError(
          'AI daily plan is missing a required item type',
        );
      }

      /*
       * Завершённые и заблокированные элементы всегда остаются результатом
       * правил. При safety-ограничении AI также не может изменить workout.
       */
      if (
        ruleItem.status !== PlanItemStatus.Pending ||
        (ruleItem.type === 'workout' &&
          safetyDecision.action !== SafetyAction.Allow)
      ) {
        return ruleItem;
      }

      return {
        type: ruleItem.type,
        status: ruleItem.status,
        order: ruleItem.order,
        source: PlanItemSource.Ai,
        payload: {
          title: generatedItem.title,
          description: generatedItem.description,
          explanation: generatedItem.explanation,
        },
      };
    });
  }

  private async findExistingPlan(
    userId: string,
    localDate: string,
  ): Promise<DailyPlan | null> {
    const plan = await this.dailyPlansRepository.findOne({
      where: {
        userId,
        localDate,
      },
      relations: {
        items: true,
      },
    });

    return this.resolveCompleteStoredPlan(plan);
  }

  private async persistPlan(
    userId: string,
    localDate: string,
    schemaVersion: number,
    items: readonly DailyPlanDomainItem[],
  ): Promise<DailyPlan> {
    return this.dataSource.transaction(async (manager) => {
      /*
       * Блокировка пользователя сериализует сохранение дневного плана.
       * Вызов AI остаётся вне транзакции и не удерживает соединение с БД.
       */
      const user = await manager.getRepository(User).findOne({
        where: {
          id: userId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (user === null) {
        throw new NotFoundException('User not found');
      }

      const plansRepository = manager.getRepository(DailyPlan);
      const itemsRepository = manager.getRepository(PlanItem);

      const existingPlan = await plansRepository.findOne({
        where: {
          userId,
          localDate,
        },
        relations: {
          items: true,
        },
      });

      const completeExistingPlan = this.resolveCompleteStoredPlan(existingPlan);

      if (completeExistingPlan !== null) {
        return completeExistingPlan;
      }

      const plan =
        existingPlan ??
        plansRepository.create({
          userId,
          localDate,
          status: DailyPlanStatus.Active,
          summary: null,
        });

      plan.schemaVersion = schemaVersion;

      const savedPlan = await plansRepository.save(plan);

      const planItems = itemsRepository.create(
        items.map((item) => ({
          planId: savedPlan.id,
          type: item.type,
          status: item.status,
          order: item.order,
          source: item.source,
          payload: item.payload,
        })),
      );

      const savedItems = await itemsRepository.save(planItems);

      savedPlan.items = this.sortPlanItems(savedItems);

      return savedPlan;
    });
  }

  private resolveCompleteStoredPlan(plan: DailyPlan | null): DailyPlan | null {
    if (plan === null || plan.items.length === 0) {
      return null;
    }

    const storedTypes = new Set(plan.items.map((item) => item.type));

    const complete =
      plan.items.length === DAILY_PLAN_ITEM_TYPES.length &&
      storedTypes.size === DAILY_PLAN_ITEM_TYPES.length &&
      DAILY_PLAN_ITEM_TYPES.every((type) => storedTypes.has(type));

    if (!complete) {
      throw new Error('Stored daily plan has an incomplete item set');
    }

    plan.items = this.sortPlanItems(plan.items);

    return plan;
  }

  private sortPlanItems(items: readonly PlanItem[]): PlanItem[] {
    return [...items].sort(
      (firstItem, secondItem) => firstItem.order - secondItem.order,
    );
  }

  private createInvalidResponseError(message: string): AiProviderError {
    return new AiProviderError(
      AiProviderErrorCode.InvalidResponse,
      message,
      false,
    );
  }
}
