import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  confirmMealRequestSchema,
  type ConfirmMealRequest,
  type ConfirmMealResponse,
} from '@your-shadow/contracts';
import { isUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';

import { LocalDateService } from '../../plans/services/local-date.service';
import { ProfilesService } from '../../profiles/services/profiles.service';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import {
  MealEntry,
  MealEntrySource,
  MealEntryStatus,
} from '../entities/meal-entry.entity';
import { createMealEntryEncryptionContext } from '../security/meal-entry-encryption-context';
import { MealNutritionValidationAction } from '../validation/meal-nutrition-validation.types';
import { MealNutritionValidatorService } from '../validation/meal-nutrition-validator.service';

@Injectable()
export class MealConfirmationService {
  constructor(
    @InjectRepository(MealEntry)
    private readonly mealEntriesRepository: Repository<MealEntry>,
    private readonly profilesService: ProfilesService,
    private readonly localDateService: LocalDateService,
    private readonly dataEncryptionService: DataEncryptionService,
    private readonly mealNutritionValidatorService: MealNutritionValidatorService,
  ) {}

  async confirm(
    userId: string,
    input: unknown,
    requestId?: string,
  ): Promise<ConfirmMealResponse> {
    const parsed = confirmMealRequestSchema.safeParse(input);

    if (!parsed.success) {
      throw new BadRequestException('Invalid meal confirmation');
    }

    if (requestId !== undefined && !isUUID(requestId, '4')) {
      throw new BadRequestException('Invalid confirmation request ID');
    }

    const request: ConfirmMealRequest = parsed.data;
    const id = requestId ?? randomUUID();

    if (request.source === 'ai') {
      this.validateAiFoods(request);
    }

    const existing = await this.mealEntriesRepository.findOneBy({ id });

    if (existing !== null) {
      return this.toResponse(existing, userId, request);
    }

    const profile = await this.profilesService.getProfile(userId);
    const confirmedAt = new Date();
    const localDate = this.localDateService.resolveLocalDate(
      profile.timezone,
      confirmedAt,
    );

    const entry = this.mealEntriesRepository.create({
      id,
      userId,
      encryptedData: this.dataEncryptionService.encrypt(
        { schemaVersion: 1, ...request },
        createMealEntryEncryptionContext(userId, id),
      ),
      localDate,
      status: MealEntryStatus.Confirmed,
      source:
        request.source === 'ai' ? MealEntrySource.Ai : MealEntrySource.Manual,
      schemaVersion: 1,
      confirmedAt,
    });

    await this.mealEntriesRepository
      .createQueryBuilder()
      .insert()
      .into(MealEntry)
      .values(entry)
      .orIgnore()
      .execute();

    const stored = await this.mealEntriesRepository.findOneByOrFail({
      id,
    });

    return this.toResponse(stored, userId, request);
  }

  private toResponse(
    entry: MealEntry,
    userId: string,
    request: ConfirmMealRequest,
  ): ConfirmMealResponse {
    if (
      entry.userId !== userId ||
      entry.status !== MealEntryStatus.Confirmed ||
      entry.localDate === null ||
      entry.confirmedAt === null
    ) {
      throw new ConflictException('Confirmation request ID already used');
    }

    const storedData = this.dataEncryptionService.decrypt<object>(
      entry.encryptedData,
      createMealEntryEncryptionContext(userId, entry.id),
    );

    if (
      JSON.stringify(storedData) !==
      JSON.stringify({ schemaVersion: 1, ...request })
    ) {
      throw new ConflictException('Confirmation request ID already used');
    }

    return {
      id: entry.id,
      status: 'confirmed',
      source: request.source,
      mealType: request.mealType,
      localDate: entry.localDate,
      confirmedAt: entry.confirmedAt.toISOString(),
    };
  }

  validateAiFoods(
    request: Extract<ConfirmMealRequest, { source: 'ai' }>,
  ): void {
    const result = this.mealNutritionValidatorService.validate({
      schemaVersion: 1,
      foods: request.foods.map((food) => ({
        ...food,
        confidence: 1,
      })),
      totals: request.totals,
      confidence: 1,
      clarification: {
        needed: false,
        question: null,
      },
    });

    if (result.action !== MealNutritionValidationAction.Accept) {
      throw new BadRequestException('Meal nutrition values need correction');
    }
  }
}
