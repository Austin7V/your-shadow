import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import { CreateHealthConstraintDto } from './dto/create-health-constraint.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { HealthConstraintResponseDto } from './dto/health-constraint-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateHealthConstraintDto } from './dto/update-health-constraint.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { WeightEntryResponseDto } from './dto/weight-entry-response.dto';
import { HealthConstraintsService } from './services/health-constraints.service';
import { ProfilesService } from './services/profiles.service';
import { WeightEntriesService } from './services/weight-entries.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly weightEntriesService: WeightEntriesService,
    private readonly healthConstraintsService: HealthConstraintsService,
  ) {}

  @Post()
  createProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.createProfile(request.auth.userId, dto);
  }

  @Get()
  getProfile(
    @Req() request: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(request.auth.userId);
  }

  @Patch()
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.updateProfile(request.auth.userId, dto);
  }

  @Post('weights')
  createWeightEntry(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateWeightEntryDto,
  ): Promise<WeightEntryResponseDto> {
    return this.weightEntriesService.createWeightEntry(
      request.auth.userId,
      dto,
    );
  }

  @Get('weights')
  listWeightEntries(
    @Req() request: AuthenticatedRequest,
  ): Promise<WeightEntryResponseDto[]> {
    return this.weightEntriesService.listWeightEntries(request.auth.userId);
  }

  @Post('health-constraints')
  createHealthConstraint(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateHealthConstraintDto,
  ): Promise<HealthConstraintResponseDto> {
    return this.healthConstraintsService.createHealthConstraint(
      request.auth.userId,
      dto,
    );
  }

  @Get('health-constraints')
  listHealthConstraints(
    @Req() request: AuthenticatedRequest,
  ): Promise<HealthConstraintResponseDto[]> {
    return this.healthConstraintsService.listHealthConstraints(
      request.auth.userId,
    );
  }

  @Patch('health-constraints/:constraintId')
  updateHealthConstraint(
    @Req() request: AuthenticatedRequest,
    @Param('constraintId', new ParseUUIDPipe({ version: '4' }))
    constraintId: string,
    @Body() dto: UpdateHealthConstraintDto,
  ): Promise<HealthConstraintResponseDto> {
    return this.healthConstraintsService.updateHealthConstraint(
      request.auth.userId,
      constraintId,
      dto,
    );
  }
}
