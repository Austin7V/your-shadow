import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  AllowedPlanItemStatusUpdate,
  GenerateTodayPlanResponse,
  GetTodayPlanResponse,
  UpdateTodayPlanItemStatusResponse,
} from '@your-shadow/contracts';
import { DataSource, Repository } from 'typeorm';

import { SafetyCode } from '../../ai/safety/safety.types';
import { HealthConstraintType } from '../../profiles/enums/health-constraint-type.enum';
import { HealthConstraintsService } from '../../profiles/services/health-constraints.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { WeightEntriesService } from '../../profiles/services/weight-entries.service';
import { DailyPlan } from '../entities/daily-plan.entity';
import {
  PlanItem,
  PlanItemSource,
  PlanItemStatus,
} from '../entities/plan-item.entity';
import {
  toTodayPlanNotGeneratedResponse,
  toTodayPlanReadyResponse,
  toUpdatedPlanItemResponse,
} from '../mappers/today-plan-response.mapper';
import {
  DailyPlanGenerationMode,
  type DailyPlanGenerationResult,
} from '../types/daily-plan-generation.types';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { LocalDateService } from './local-date.service';

const READY_PLAN_USER_MESSAGE = 'Your daily plan is ready.';

const FALLBACK_PLAN_USER_MESSAGE =
  'AI is temporarily unavailable. A safe fallback plan was created for today.';

interface PlanPresentation {
  readonly mode: DailyPlanGenerationMode;
  readonly userMessage: string;
}

@Injectable()
export class TodayPlanService {
  constructor(
    @InjectRepository(DailyPlan)
    private readonly dailyPlansRepository: Repository<DailyPlan>,
    private readonly dataSource: DataSource,
    private readonly profilesService: ProfilesService,
    private readonly weightEntriesService: WeightEntriesService,
    private readonly healthConstraintsService: HealthConstraintsService,
    private readonly dailyPlanGenerationService: DailyPlanGenerationService,
    private readonly localDateService: LocalDateService,
  ) {}

  async getTodayForUser(
    userId: string,
    instant: Date = new Date(),
  ): Promise<GetTodayPlanResponse> {
    const localDate = await this.resolveLocalDate(userId, instant);
    const plan = await this.findPlanForDate(userId, localDate);

    if (plan === null) {
      return toTodayPlanNotGeneratedResponse(localDate);
    }

    const presentation = this.resolvePlanPresentation(plan);

    return toTodayPlanReadyResponse(
      plan,
      presentation.mode,
      presentation.userMessage,
    );
  }

  async generateTodayForUser(
    userId: string,
    instant: Date = new Date(),
  ): Promise<GenerateTodayPlanResponse> {
    const localDate = await this.resolveLocalDate(userId, instant);
    const existingPlan = await this.findPlanForDate(userId, localDate);

    if (existingPlan !== null) {
      const presentation = this.resolvePlanPresentation(existingPlan);

      return toTodayPlanReadyResponse(
        existingPlan,
        presentation.mode,
        presentation.userMessage,
      );
    }

    const previousLocalDate = this.resolvePreviousLocalDate(localDate);

    const [weightEntries, healthConstraints, previousPlan] = await Promise.all([
      this.weightEntriesService.listWeightEntries(userId),
      this.healthConstraintsService.listHealthConstraints(userId),
      this.findPlanForDate(userId, previousLocalDate),
    ]);

    const latestWeight = weightEntries[0] ?? null;

    const activeConstraints = healthConstraints.filter(
      (constraint) => constraint.isActive,
    );

    const reportedSafetyCodes = [
      ...new Set(
        activeConstraints.map((constraint) =>
          constraint.type === HealthConstraintType.MEDICAL_RESTRICTION
            ? SafetyCode.ActiveMedicalRestriction
            : SafetyCode.ActiveHealthConstraint,
        ),
      ),
    ];

    const previousWorkout = previousPlan?.items.find(
      (item) => item.type === 'workout',
    );

    const generationResult =
      await this.dailyPlanGenerationService.generateForUser(userId, {
        instant,
        reportedSafetyCodes,
        currentWeightKg: latestWeight?.weightKg ?? null,
        constraints: activeConstraints.map((constraint) => ({
          type: constraint.type,
          severity: constraint.severity,
          title: constraint.title,
          isActive: constraint.isActive,
        })),
        latestSummary:
          previousPlan?.summary === null || previousPlan?.summary === undefined
            ? null
            : {
                text: previousPlan.summary,
                date: previousPlan.localDate,
              },
        currentDay: {
          nutritionLogged: false,
          workoutCompleted: false,
          checkInCompleted: false,
        },
        previousDay: {
          workoutCompleted:
            previousWorkout === undefined
              ? null
              : previousWorkout.status === PlanItemStatus.Completed,
        },
      });

    return this.mapGenerationResult(generationResult);
  }

  async updateTodayItemStatus(
    userId: string,
    itemId: string,
    status: AllowedPlanItemStatusUpdate,
    instant: Date = new Date(),
  ): Promise<UpdateTodayPlanItemStatusResponse> {
    const localDate = await this.resolveLocalDate(userId, instant);

    return this.dataSource.transaction<UpdateTodayPlanItemStatusResponse>(
      async (manager): Promise<UpdateTodayPlanItemStatusResponse> => {
        const planItemsRepository = manager.getRepository(PlanItem);

        const item = await planItemsRepository
          .createQueryBuilder('item')
          .innerJoinAndSelect('item.plan', 'plan')
          .where('item.id = :itemId', {
            itemId,
          })
          .andWhere('plan.user_id = :userId', {
            userId,
          })
          .andWhere('plan.local_date = :localDate', {
            localDate,
          })
          .setLock('pessimistic_write')
          .getOne();

        if (item === null) {
          throw new NotFoundException('Plan item not found');
        }

        if (item.status !== PlanItemStatus.Pending) {
          throw new BadRequestException(
            'Only pending plan items can be updated',
          );
        }

        item.status =
          status === 'completed'
            ? PlanItemStatus.Completed
            : PlanItemStatus.Skipped;

        const savedItem = await planItemsRepository.save(item);

        return toUpdatedPlanItemResponse(savedItem);
      },
    );
  }

  private async resolveLocalDate(
    userId: string,
    instant: Date,
  ): Promise<string> {
    const profile = await this.profilesService.getProfile(userId);

    return this.localDateService.resolveLocalDate(profile.timezone, instant);
  }

  private findPlanForDate(
    userId: string,
    localDate: string,
  ): Promise<DailyPlan | null> {
    return this.dailyPlansRepository.findOne({
      where: {
        userId,
        localDate,
      },
      relations: {
        items: true,
      },
    });
  }

  private resolvePreviousLocalDate(localDate: string): string {
    const date = new Date(`${localDate}T00:00:00.000Z`);

    date.setUTCDate(date.getUTCDate() - 1);

    return date.toISOString().slice(0, 10);
  }

  private resolvePlanPresentation(plan: DailyPlan): PlanPresentation {
    const sources = new Set(plan.items.map((item) => item.source));

    if (sources.has(PlanItemSource.Ai)) {
      return {
        mode: DailyPlanGenerationMode.Ai,
        userMessage: READY_PLAN_USER_MESSAGE,
      };
    }

    if (sources.has(PlanItemSource.Fallback)) {
      return {
        mode: DailyPlanGenerationMode.Fallback,
        userMessage: FALLBACK_PLAN_USER_MESSAGE,
      };
    }

    return {
      mode: DailyPlanGenerationMode.Rules,
      userMessage: READY_PLAN_USER_MESSAGE,
    };
  }

  private mapGenerationResult(
    result: DailyPlanGenerationResult,
  ): GenerateTodayPlanResponse {
    return toTodayPlanReadyResponse(
      result.plan,
      result.mode,
      result.userMessage,
    );
  }
}
