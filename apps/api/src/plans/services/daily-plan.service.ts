import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { ProfilesService } from '../../profiles/services/profiles.service';
import { DailyPlan } from '../entities/daily-plan.entity';
import { LocalDateService } from './local-date.service';

@Injectable()
export class DailyPlanService {
  constructor(
    @InjectRepository(DailyPlan)
    private readonly dailyPlansRepository: Repository<DailyPlan>,
    private readonly dataSource: DataSource,
    private readonly profilesService: ProfilesService,
    private readonly localDateService: LocalDateService,
  ) {}

  async getOrCreateForUser(
    userId: string,
    instant: Date = new Date(),
  ): Promise<DailyPlan> {
    const profile = await this.profilesService.getProfile(userId);

    const localDate = this.localDateService.resolveLocalDate(
      profile.timezone,
      instant,
    );

    return this.getOrCreateForLocalDate(userId, localDate);
  }

  private async getOrCreateForLocalDate(
    userId: string,
    localDate: string,
  ): Promise<DailyPlan> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(DailyPlan);

        const existingPlan = await repository.findOne({
          where: {
            userId,
            localDate,
          },
        });

        if (existingPlan !== null) {
          return existingPlan;
        }

        const plan = repository.create({
          userId,
          localDate,
          summary: null,
        });

        return repository.save(plan);
      });
    } catch (error) {
      if (!this.isUniqueConstraintViolation(error)) {
        throw error;
      }

      const existingPlan = await this.dailyPlansRepository.findOne({
        where: {
          userId,
          localDate,
        },
      });

      if (existingPlan === null) {
        throw error;
      }

      return existingPlan;
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError: unknown = error.driverError;

    if (
      typeof driverError !== 'object' ||
      driverError === null ||
      !('code' in driverError)
    ) {
      return false;
    }

    return driverError.code === '23505';
  }
}
