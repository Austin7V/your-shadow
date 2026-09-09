import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  GenerateTodayPlanResponse,
  GetTodayPlanResponse,
  UpdateTodayPlanItemStatusResponse,
} from '@your-shadow/contracts';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePlanItemStatusDto } from './dto/update-plan-item-status.dto';
import { TodayPlanService } from './services/today-plan.service';

interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly todayPlanService: TodayPlanService) {}

  @Get('today')
  getTodayPlan(
    @Req() request: AuthenticatedRequest,
  ): Promise<GetTodayPlanResponse> {
    return this.todayPlanService.getTodayForUser(request.auth.userId);
  }

  @Post('today/generate')
  generateTodayPlan(
    @Req() request: AuthenticatedRequest,
  ): Promise<GenerateTodayPlanResponse> {
    return this.todayPlanService.generateTodayForUser(request.auth.userId);
  }

  @Patch('today/items/:itemId/status')
  updateTodayPlanItemStatus(
    @Req() request: AuthenticatedRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePlanItemStatusDto,
  ): Promise<UpdateTodayPlanItemStatusResponse> {
    return this.todayPlanService.updateTodayItemStatus(
      request.auth.userId,
      itemId,
      dto.status,
    );
  }
}
