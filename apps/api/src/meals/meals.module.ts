import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MealEntry } from './entities/meal-entry.entity';
import { MealNutritionValidatorService } from './validation/meal-nutrition-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([MealEntry])],
  providers: [MealNutritionValidatorService],
  exports: [MealNutritionValidatorService],
})
export class MealsModule {}
