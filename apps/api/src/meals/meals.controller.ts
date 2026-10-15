import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  ConfirmMealResponse,
  ListMealsResponse,
  MealEntryResponse,
  ParseMealResponse,
} from '@your-shadow/contracts';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListMealsQueryDto } from './dto/list-meals-query.dto';
import { ParseMealDto } from './dto/parse-meal.dto';
import { MealParsingRateLimitService } from './security/meal-parsing-rate-limit.service';
import { MealConfirmationService } from './services/meal-confirmation.service';
import { MealManagementService } from './services/meal-management.service';
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
    private readonly mealConfirmationService: MealConfirmationService,
    private readonly mealManagementService: MealManagementService,
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

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  confirmMeal(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
    @Headers('idempotency-key') requestId: string | undefined,
  ): Promise<ConfirmMealResponse> {
    return this.mealConfirmationService.confirm(
      request.auth.userId,
      body,
      requestId,
    );
  }

  @Get()
  listMeals(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListMealsQueryDto,
  ): Promise<ListMealsResponse> {
    return this.mealManagementService.list(request.auth.userId, query.date);
  }

  @Get(':id')
  getMeal(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<MealEntryResponse> {
    return this.mealManagementService.get(request.auth.userId, id);
  }

  @Patch(':id')
  updateMeal(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: unknown,
  ): Promise<MealEntryResponse> {
    return this.mealManagementService.update(request.auth.userId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMeal(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.mealManagementService.remove(request.auth.userId, id);
  }
}
