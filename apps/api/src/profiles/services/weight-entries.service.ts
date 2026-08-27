import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { CreateWeightEntryDto } from '../dto/create-weight-entry.dto';
import { WeightEntryResponseDto } from '../dto/weight-entry-response.dto';
import { WeightEntry } from '../entities/weight-entry.entity';
import { toWeightEntryResponseDto } from '../mappers/profile-response.mapper';
import { WeightEntryEncryptedData } from '../types/weight-entry-encrypted-data.type';

@Injectable()
export class WeightEntriesService {
  constructor(
    @InjectRepository(WeightEntry)
    private readonly weightEntriesRepository: Repository<WeightEntry>,
    private readonly dataEncryptionService: DataEncryptionService,
  ) {}

  async createWeightEntry(
    userId: string,
    dto: CreateWeightEntryDto,
  ): Promise<WeightEntryResponseDto> {
    const measuredAt =
      dto.measuredAt === undefined ? new Date() : new Date(dto.measuredAt);

    if (measuredAt.getTime() > Date.now()) {
      throw new BadRequestException('Measurement date cannot be in the future');
    }

    const weightData: WeightEntryEncryptedData = {
      schemaVersion: 1,
      weightKg: dto.weightKg,
    };

    const weightEntry = this.weightEntriesRepository.create({
      userId,
      encryptedData: this.dataEncryptionService.encrypt(
        weightData,
        this.createEncryptionContext(userId),
      ),
      measuredAt,
    });

    const savedWeightEntry =
      await this.weightEntriesRepository.save(weightEntry);

    return toWeightEntryResponseDto(savedWeightEntry, weightData);
  }

  async listWeightEntries(userId: string): Promise<WeightEntryResponseDto[]> {
    const weightEntries = await this.weightEntriesRepository.find({
      where: {
        userId,
      },
      order: {
        measuredAt: 'DESC',
      },
    });

    return weightEntries.map((weightEntry) => {
      const weightData =
        this.dataEncryptionService.decrypt<WeightEntryEncryptedData>(
          weightEntry.encryptedData,
          this.createEncryptionContext(weightEntry.userId),
        );

      return toWeightEntryResponseDto(weightEntry, weightData);
    });
  }

  private createEncryptionContext(userId: string): string {
    return `weight-entry:${userId}`;
  }
}
