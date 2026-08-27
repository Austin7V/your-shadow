import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { CreateHealthConstraintDto } from '../dto/create-health-constraint.dto';
import { HealthConstraintResponseDto } from '../dto/health-constraint-response.dto';
import { UpdateHealthConstraintDto } from '../dto/update-health-constraint.dto';
import { HealthConstraint } from '../entities/health-constraint.entity';
import { toHealthConstraintResponseDto } from '../mappers/profile-response.mapper';
import { HealthConstraintEncryptedData } from '../types/health-constraint-encrypted-data.type';

@Injectable()
export class HealthConstraintsService {
  constructor(
    @InjectRepository(HealthConstraint)
    private readonly healthConstraintsRepository: Repository<HealthConstraint>,
    private readonly dataEncryptionService: DataEncryptionService,
  ) {}

  async createHealthConstraint(
    userId: string,
    dto: CreateHealthConstraintDto,
  ): Promise<HealthConstraintResponseDto> {
    const constraintData: HealthConstraintEncryptedData = {
      schemaVersion: 1,
      type: dto.type,
      title: dto.title,
      notes: dto.notes ?? null,
      severity: dto.severity,
    };

    const healthConstraint = this.healthConstraintsRepository.create({
      userId,
      encryptedData: this.dataEncryptionService.encrypt(
        constraintData,
        this.createEncryptionContext(userId),
      ),
      isActive: true,
    });

    const savedHealthConstraint =
      await this.healthConstraintsRepository.save(healthConstraint);

    return toHealthConstraintResponseDto(savedHealthConstraint, constraintData);
  }

  async listHealthConstraints(
    userId: string,
  ): Promise<HealthConstraintResponseDto[]> {
    const healthConstraints = await this.healthConstraintsRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return healthConstraints.map((healthConstraint) => {
      const constraintData =
        this.dataEncryptionService.decrypt<HealthConstraintEncryptedData>(
          healthConstraint.encryptedData,
          this.createEncryptionContext(healthConstraint.userId),
        );

      return toHealthConstraintResponseDto(healthConstraint, constraintData);
    });
  }

  async updateHealthConstraint(
    userId: string,
    constraintId: string,
    dto: UpdateHealthConstraintDto,
  ): Promise<HealthConstraintResponseDto> {
    const healthConstraint = await this.findHealthConstraintOrThrow(
      userId,
      constraintId,
    );

    const currentData =
      this.dataEncryptionService.decrypt<HealthConstraintEncryptedData>(
        healthConstraint.encryptedData,
        this.createEncryptionContext(healthConstraint.userId),
      );

    const updatedData: HealthConstraintEncryptedData = {
      schemaVersion: 1,
      type: dto.type ?? currentData.type,
      title: dto.title ?? currentData.title,
      notes: dto.notes === undefined ? currentData.notes : dto.notes,
      severity: dto.severity ?? currentData.severity,
    };

    healthConstraint.encryptedData = this.dataEncryptionService.encrypt(
      updatedData,
      this.createEncryptionContext(userId),
    );

    if (dto.isActive !== undefined) {
      healthConstraint.isActive = dto.isActive;
    }

    const savedHealthConstraint =
      await this.healthConstraintsRepository.save(healthConstraint);

    return toHealthConstraintResponseDto(savedHealthConstraint, updatedData);
  }

  private async findHealthConstraintOrThrow(
    userId: string,
    constraintId: string,
  ): Promise<HealthConstraint> {
    const healthConstraint = await this.healthConstraintsRepository.findOne({
      where: {
        id: constraintId,
        userId,
      },
    });

    if (healthConstraint === null) {
      throw new NotFoundException('Health constraint not found');
    }

    return healthConstraint;
  }

  private createEncryptionContext(userId: string): string {
    return `health-constraint:${userId}`;
  }
}
