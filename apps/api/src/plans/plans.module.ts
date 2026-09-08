import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from '../ai/ai.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { DailyPlan } from './entities/daily-plan.entity';
import { PlanItem } from './entities/plan-item.entity';
import { DailyPlanFallbackBuilder } from './fallback/daily-plan-fallback.builder';
import { DailyPlanRuleService } from './rules/daily-plan-rule.service';
import { DailyPlanGenerationService } from './services/daily-plan-generation.service';
import { DailyPlanService } from './services/daily-plan.service';
import { LocalDateService } from './services/local-date.service';

@Module({
  imports: [
    AiModule,
    ProfilesModule,
    TypeOrmModule.forFeature([DailyPlan, PlanItem]),
  ],
  providers: [
    DailyPlanFallbackBuilder,
    DailyPlanGenerationService,
    DailyPlanService,
    DailyPlanRuleService,
    LocalDateService,
  ],
  exports: [DailyPlanGenerationService, DailyPlanService, DailyPlanRuleService],
})
export class PlansModule {}
