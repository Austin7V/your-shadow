import { Injectable } from '@nestjs/common';
import type {
  DailyNutritionTotalsResponse,
  MealNutritionTotals,
} from '@your-shadow/contracts';

import { MealManagementService } from './meal-management.service';

function roundGrams(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

@Injectable()
export class DailyNutritionTotalsService {
  constructor(private readonly mealManagementService: MealManagementService) {}

  async get(
    userId: string,
    date: string,
  ): Promise<DailyNutritionTotalsResponse> {
    const { meals } = await this.mealManagementService.list(userId, date);

    const totals: MealNutritionTotals = {
      caloriesKcal: 0,
      proteinGrams: 0,
      fatGrams: 0,
      carbohydratesGrams: 0,
    };

    for (const meal of meals) {
      const nutrition = meal.source === 'ai' ? meal.totals : meal.nutrition;

      totals.caloriesKcal += nutrition.caloriesKcal;
      totals.proteinGrams += nutrition.proteinGrams;
      totals.fatGrams += nutrition.fatGrams;
      totals.carbohydratesGrams += nutrition.carbohydratesGrams;
    }

    return {
      localDate: date,
      mealCount: meals.length,
      caloriesKcal: totals.caloriesKcal,
      proteinGrams: roundGrams(totals.proteinGrams),
      fatGrams: roundGrams(totals.fatGrams),
      carbohydratesGrams: roundGrams(totals.carbohydratesGrams),
    };
  }
}
