import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesModule } from '../profiles/profiles.module';
import { DailyPlan } from './entities/daily-plan.entity';
import { PlanItem } from './entities/plan-item.entity';
import { DailyPlanService } from './services/daily-plan.service';
import { LocalDateService } from './services/local-date.service';

@Module({
  imports: [ProfilesModule, TypeOrmModule.forFeature([DailyPlan, PlanItem])],
  providers: [DailyPlanService, LocalDateService],
  exports: [DailyPlanService],
})
export class PlansModule {}
