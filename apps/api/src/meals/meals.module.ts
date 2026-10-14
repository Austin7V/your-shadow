import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { LocalDateService } from '../plans/services/local-date.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { SecurityModule } from '../security/security.module';
import { MealEntry } from './entities/meal-entry.entity';
import { MealsController } from './meals.controller';
import { MealParsingRateLimitService } from './security/meal-parsing-rate-limit.service';
import { MealConfirmationService } from './services/meal-confirmation.service';
import { MealParsingService } from './services/meal-parsing.service';
import { MealNutritionValidatorService } from './validation/meal-nutrition-validator.service';

@Module({
  imports: [
    AiModule,
    AuthModule,
    ProfilesModule,
    SecurityModule,
    TypeOrmModule.forFeature([MealEntry]),
  ],
  controllers: [MealsController],
  providers: [
    LocalDateService,
    MealNutritionValidatorService,
    MealParsingRateLimitService,
    MealParsingService,
    MealConfirmationService,
  ],
  exports: [MealNutritionValidatorService, MealParsingService],
})
export class MealsModule {}
