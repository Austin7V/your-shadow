import { HealthConstraintSeverity } from '../enums/health-constraint-severity.enum';
import { HealthConstraintType } from '../enums/health-constraint-type.enum';
import { ProfileGoal } from '../enums/profile-goal.enum';
import { HealthConstraint } from '../entities/health-constraint.entity';
import { Profile } from '../entities/profile.entity';
import { WeightEntry } from '../entities/weight-entry.entity';
import { HealthConstraintEncryptedData } from '../types/health-constraint-encrypted-data.type';
import { ProfileEncryptedData } from '../types/profile-encrypted-data.type';
import { WeightEntryEncryptedData } from '../types/weight-entry-encrypted-data.type';
import {
  toHealthConstraintResponseDto,
  toProfileResponseDto,
  toWeightEntryResponseDto,
} from './profile-response.mapper';

describe('profile response mapper', () => {
  it('maps a profile without exposing protected storage fields', () => {
    const profile = new Profile();

    profile.id = 'profile-id';
    profile.userId = 'user-id';
    profile.encryptedData = 'encrypted-profile';
    profile.onboardingCompletedAt = null;
    profile.createdAt = new Date('2026-08-27T10:00:00.000Z');
    profile.updatedAt = new Date('2026-08-27T11:00:00.000Z');

    const data: ProfileEncryptedData = {
      schemaVersion: 1,
      firstName: 'Sergey',
      lastName: 'Badin',
      userName: 'Sergey',
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone: 'Europe/Berlin',
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
    };

    const response = toProfileResponseDto(profile, data);

    expect(response).toEqual({
      id: 'profile-id',
      firstName: 'Sergey',
      lastName: 'Badin',
      userName: 'Sergey',
      dateOfBirth: '1993-07-31',
      heightCm: 184,
      timezone: 'Europe/Berlin',
      primaryGoal: ProfileGoal.LOSE_WEIGHT,
      targetWeightKg: 95,
      lastDoctorVisitAt: null,
      onboardingCompletedAt: null,
      createdAt: '2026-08-27T10:00:00.000Z',
      updatedAt: '2026-08-27T11:00:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
    expect(response).not.toHaveProperty('schemaVersion');
  });

  it('maps a weight entry without exposing protected storage fields', () => {
    const weightEntry = new WeightEntry();

    weightEntry.id = 'weight-entry-id';
    weightEntry.userId = 'user-id';
    weightEntry.encryptedData = 'encrypted-weight';
    weightEntry.measuredAt = new Date('2026-08-27T08:00:00.000Z');
    weightEntry.createdAt = new Date('2026-08-27T08:01:00.000Z');
    weightEntry.updatedAt = new Date('2026-08-27T08:01:00.000Z');

    const data: WeightEntryEncryptedData = {
      schemaVersion: 1,
      weightKg: 114.4,
    };

    const response = toWeightEntryResponseDto(weightEntry, data);

    expect(response).toEqual({
      id: 'weight-entry-id',
      weightKg: 114.4,
      measuredAt: '2026-08-27T08:00:00.000Z',
      createdAt: '2026-08-27T08:01:00.000Z',
      updatedAt: '2026-08-27T08:01:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
    expect(response).not.toHaveProperty('schemaVersion');
  });

  it('maps a health constraint without exposing protected fields', () => {
    const healthConstraint = new HealthConstraint();

    healthConstraint.id = 'constraint-id';
    healthConstraint.userId = 'user-id';
    healthConstraint.encryptedData = 'encrypted-constraint';
    healthConstraint.isActive = true;
    healthConstraint.createdAt = new Date('2026-08-27T09:00:00.000Z');
    healthConstraint.updatedAt = new Date('2026-08-27T09:30:00.000Z');

    const data: HealthConstraintEncryptedData = {
      schemaVersion: 1,
      type: HealthConstraintType.INJURY,
      title: 'Lower back pain',
      notes: 'Avoid high-impact exercises.',
      severity: HealthConstraintSeverity.MODERATE,
    };

    const response = toHealthConstraintResponseDto(healthConstraint, data);

    expect(response).toEqual({
      id: 'constraint-id',
      type: HealthConstraintType.INJURY,
      title: 'Lower back pain',
      notes: 'Avoid high-impact exercises.',
      severity: HealthConstraintSeverity.MODERATE,
      isActive: true,
      createdAt: '2026-08-27T09:00:00.000Z',
      updatedAt: '2026-08-27T09:30:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('encryptedData');
    expect(response).not.toHaveProperty('schemaVersion');
  });
});
