import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEncryptionService } from '../../security/services/data-encryption.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Profile } from '../entities/profile.entity';
import { toProfileResponseDto } from '../mappers/profile-response.mapper';
import { ProfileEncryptedData } from '../types/profile-encrypted-data.type';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly dataEncryptionService: DataEncryptionService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    const existingProfile = await this.profilesRepository.findOne({
      where: {
        userId,
      },
    });

    if (existingProfile !== null) {
      throw new ConflictException('Profile already exists');
    }

    const profileData: ProfileEncryptedData = {
      schemaVersion: 1,
      firstName: dto.firstName,
      lastName: dto.lastName,
      userName: dto.userName,
      dateOfBirth: dto.dateOfBirth,
      heightCm: dto.heightCm,
      timezone: dto.timezone,
      primaryGoal: dto.primaryGoal,
      targetWeightKg: dto.targetWeightKg ?? null,
      lastDoctorVisitAt: dto.lastDoctorVisitAt ?? null,
    };

    const profile = this.profilesRepository.create({
      userId,
      encryptedData: this.dataEncryptionService.encrypt(
        profileData,
        this.createProfileEncryptionContext(userId),
      ),
      onboardingCompletedAt: null,
    });

    const savedProfile = await this.profilesRepository.save(profile);

    return toProfileResponseDto(savedProfile, profileData);
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const profile = await this.findProfileOrThrow(userId);
    const profileData = this.decryptProfile(profile);

    return toProfileResponseDto(profile, profileData);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.findProfileOrThrow(userId);
    const currentData = this.decryptProfile(profile);

    const updatedData: ProfileEncryptedData = {
      schemaVersion: 1,
      firstName: dto.firstName ?? currentData.firstName,
      lastName: dto.lastName ?? currentData.lastName,
      userName: dto.userName ?? currentData.userName,
      dateOfBirth: dto.dateOfBirth ?? currentData.dateOfBirth,
      heightCm: dto.heightCm ?? currentData.heightCm,
      timezone: dto.timezone ?? currentData.timezone,
      primaryGoal: dto.primaryGoal ?? currentData.primaryGoal,
      targetWeightKg:
        dto.targetWeightKg === undefined
          ? currentData.targetWeightKg
          : dto.targetWeightKg,
      lastDoctorVisitAt:
        dto.lastDoctorVisitAt === undefined
          ? currentData.lastDoctorVisitAt
          : dto.lastDoctorVisitAt,
    };

    profile.encryptedData = this.dataEncryptionService.encrypt(
      updatedData,
      this.createProfileEncryptionContext(userId),
    );

    const savedProfile = await this.profilesRepository.save(profile);

    return toProfileResponseDto(savedProfile, updatedData);
  }

  private async findProfileOrThrow(userId: string): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({
      where: {
        userId,
      },
    });

    if (profile === null) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  private decryptProfile(profile: Profile): ProfileEncryptedData {
    return this.dataEncryptionService.decrypt<ProfileEncryptedData>(
      profile.encryptedData,
      this.createProfileEncryptionContext(profile.userId),
    );
  }

  private createProfileEncryptionContext(userId: string): string {
    return `profile:${userId}`;
  }
}
