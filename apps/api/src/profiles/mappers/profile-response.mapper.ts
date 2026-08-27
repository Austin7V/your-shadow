import { HealthConstraintResponseDto } from '../dto/health-constraint-response.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { WeightEntryResponseDto } from '../dto/weight-entry-response.dto';
import { HealthConstraint } from '../entities/health-constraint.entity';
import { Profile } from '../entities/profile.entity';
import { WeightEntry } from '../entities/weight-entry.entity';
import { HealthConstraintEncryptedData } from '../types/health-constraint-encrypted-data.type';
import { ProfileEncryptedData } from '../types/profile-encrypted-data.type';
import { WeightEntryEncryptedData } from '../types/weight-entry-encrypted-data.type';

export const toProfileResponseDto = (
  profile: Profile,
  data: ProfileEncryptedData,
): ProfileResponseDto => ({
  id: profile.id,
  firstName: data.firstName,
  lastName: data.lastName,
  userName: data.userName,
  dateOfBirth: data.dateOfBirth,
  heightCm: data.heightCm,
  timezone: data.timezone,
  primaryGoal: data.primaryGoal,
  targetWeightKg: data.targetWeightKg,
  lastDoctorVisitAt: data.lastDoctorVisitAt,
  onboardingCompletedAt: profile.onboardingCompletedAt?.toISOString() ?? null,
  createdAt: profile.createdAt.toISOString(),
  updatedAt: profile.updatedAt.toISOString(),
});

export const toWeightEntryResponseDto = (
  weightEntry: WeightEntry,
  data: WeightEntryEncryptedData,
): WeightEntryResponseDto => ({
  id: weightEntry.id,
  weightKg: data.weightKg,
  measuredAt: weightEntry.measuredAt.toISOString(),
  createdAt: weightEntry.createdAt.toISOString(),
  updatedAt: weightEntry.updatedAt.toISOString(),
});

export const toHealthConstraintResponseDto = (
  healthConstraint: HealthConstraint,
  data: HealthConstraintEncryptedData,
): HealthConstraintResponseDto => ({
  id: healthConstraint.id,
  type: data.type,
  title: data.title,
  notes: data.notes,
  severity: data.severity,
  isActive: healthConstraint.isActive,
  createdAt: healthConstraint.createdAt.toISOString(),
  updatedAt: healthConstraint.updatedAt.toISOString(),
});
