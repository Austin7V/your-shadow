import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { ParseMealResponse } from '@your-shadow/contracts';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseMealDto } from './dto/parse-meal.dto';
import { MealParsingRateLimitService } from './security/meal-parsing-rate-limit.service';
import { MealParsingService } from './services/meal-parsing.service';

interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(
    private readonly mealParsingService: MealParsingService,
    private readonly mealParsingRateLimitService: MealParsingRateLimitService,
  ) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseMeal(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ParseMealDto,
  ): Promise<ParseMealResponse> {
    this.mealParsingRateLimitService.consume(request.auth.userId);

    return this.mealParsingService.parse(dto.originalText);
  }
}
