import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  confirmMealRequestSchema,
  updateMealRequestSchema,
  type ConfirmMealRequest,
  type ListMealsResponse,
  type MealEntryResponse,
} from '@your-shadow/contracts';
import { Repository } from 'typeorm';

import { DataEncryptionService } from '../../security/services/data-encryption.service';
import {
  MealEntry,
  MealEntrySource,
  MealEntryStatus,
} from '../entities/meal-entry.entity';
import { createMealEntryEncryptionContext } from '../security/meal-entry-encryption-context';
import { MealConfirmationService } from './meal-confirmation.service';

@Injectable()
export class MealManagementService {
  constructor(
    @InjectRepository(MealEntry)
    private readonly mealEntriesRepository: Repository<MealEntry>,
    private readonly dataEncryptionService: DataEncryptionService,
    private readonly mealConfirmationService: MealConfirmationService,
  ) {}

  async list(userId: string, date: string): Promise<ListMealsResponse> {
    const entries = await this.mealEntriesRepository.find({
      where: {
        userId,
        localDate: date,
        status: MealEntryStatus.Confirmed,
      },
      order: {
        confirmedAt: 'DESC',
        id: 'DESC',
      },
    });

    return {
      localDate: date,
      meals: entries.map((entry) => this.toResponse(entry, userId)),
    };
  }

  async get(userId: string, id: string): Promise<MealEntryResponse> {
    const entry = await this.findOwnedEntry(userId, id);
    return this.toResponse(entry, userId);
  }

  async update(
    userId: string,
    id: string,
    input: unknown,
  ): Promise<MealEntryResponse> {
    const entry = await this.findOwnedEntry(userId, id);
    const parsed = updateMealRequestSchema.safeParse(input);

    if (!parsed.success) {
      throw new BadRequestException('Invalid meal update');
    }

    const request: ConfirmMealRequest = parsed.data;

    if (request.source === 'ai') {
      this.mealConfirmationService.validateAiFoods(request);
    }

    const encryptedData = this.dataEncryptionService.encrypt(
      { schemaVersion: 1, ...request },
      createMealEntryEncryptionContext(userId, entry.id),
    );

    const result = await this.mealEntriesRepository.update(
      {
        id: entry.id,
        userId,
        status: MealEntryStatus.Confirmed,
      },
      {
        encryptedData,
        source:
          request.source === 'ai' ? MealEntrySource.Ai : MealEntrySource.Manual,
      },
    );

    if (!result.affected) {
      throw new NotFoundException('Meal not found');
    }

    const updatedEntry = await this.findOwnedEntry(userId, id);
    return this.toResponse(updatedEntry, userId);
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.mealEntriesRepository.delete({
      id,
      userId,
      status: MealEntryStatus.Confirmed,
    });

    if (!result.affected) {
      throw new NotFoundException('Meal not found');
    }
  }

  private async findOwnedEntry(userId: string, id: string): Promise<MealEntry> {
    const entry = await this.mealEntriesRepository.findOneBy({
      id,
      userId,
      status: MealEntryStatus.Confirmed,
    });

    if (entry === null) {
      throw new NotFoundException('Meal not found');
    }

    return entry;
  }

  private toResponse(entry: MealEntry, userId: string): MealEntryResponse {
    if (entry.localDate === null || entry.confirmedAt === null) {
      throw new InternalServerErrorException('Invalid saved meal');
    }

    const stored = this.dataEncryptionService.decrypt<Record<string, unknown>>(
      entry.encryptedData,
      createMealEntryEncryptionContext(userId, entry.id),
    );

    if (
      typeof stored !== 'object' ||
      stored === null ||
      Array.isArray(stored)
    ) {
      throw new InternalServerErrorException('Invalid saved meal');
    }

    const { schemaVersion, ...mealData } = stored;
    const parsed = confirmMealRequestSchema.safeParse(mealData);

    if (schemaVersion !== 1 || !parsed.success) {
      throw new InternalServerErrorException('Invalid saved meal');
    }

    const source =
      parsed.data.source === 'ai' ? MealEntrySource.Ai : MealEntrySource.Manual;

    if (source !== entry.source) {
      throw new InternalServerErrorException('Invalid saved meal');
    }

    return {
      ...parsed.data,
      id: entry.id,
      status: 'confirmed',
      localDate: entry.localDate,
      confirmedAt: entry.confirmedAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}
