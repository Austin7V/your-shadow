import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MealEntry } from './entities/meal-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealEntry])],
})
export class MealsModule {}
