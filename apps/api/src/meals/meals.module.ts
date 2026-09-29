import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { MealEntry } from './entities/meal-entry.entity';
import { MealsController } from './meals.controller';
import { MealParsingRateLimitService } from './security/meal-parsing-rate-limit.service';
import { MealParsingService } from './services/meal-parsing.service';
import { MealNutritionValidatorService } from './validation/meal-nutrition-validator.service';

@Module({
  imports: [AiModule, AuthModule, TypeOrmModule.forFeature([MealEntry])],
  controllers: [MealsController],
  providers: [
    MealNutritionValidatorService,
    MealParsingRateLimitService,
    MealParsingService,
  ],
  exports: [MealNutritionValidatorService, MealParsingService],
})
export class MealsModule {}
