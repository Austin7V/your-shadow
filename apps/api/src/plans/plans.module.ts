import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from '../ai/ai.module';
import { HealthConstraint } from '../profiles/entities/health-constraint.entity';
import { WeightEntry } from '../profiles/entities/weight-entry.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { DailyPlan } from './entities/daily-plan.entity';
import { PlanItem } from './entities/plan-item.entity';
import { DailyPlanFallbackBuilder } from './fallback/daily-plan-fallback.builder';
import { DailyPlanRuleService } from './rules/daily-plan-rule.service';
import { DailyPlanGenerationService } from './services/daily-plan-generation.service';
import { DailyPlanService } from './services/daily-plan.service';
import { LocalDateService } from './services/local-date.service';
import { TodayPlanService } from './services/today-plan.service';
import { PlansController } from './plans.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AiModule,
    AuthModule,
    ProfilesModule,
    TypeOrmModule.forFeature([
      DailyPlan,
      PlanItem,
      HealthConstraint,
      WeightEntry,
    ]),
  ],
  providers: [
    DailyPlanFallbackBuilder,
    DailyPlanGenerationService,
    DailyPlanService,
    DailyPlanRuleService,
    LocalDateService,
    TodayPlanService,
  ],
  exports: [
    DailyPlanGenerationService,
    DailyPlanService,
    DailyPlanRuleService,
    TodayPlanService,
  ],
  controllers: [PlansController],
})
export class PlansModule {}
