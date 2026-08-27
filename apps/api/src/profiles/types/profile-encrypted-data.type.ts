import { ProfileGoal } from '../enums/profile-goal.enum';

export interface ProfileEncryptedData {
  readonly schemaVersion: 1;
  readonly firstName: string;
  readonly lastName: string;
  readonly userName: string;
  readonly dateOfBirth: string;
  readonly heightCm: number;
  readonly timezone: string;
  readonly primaryGoal: ProfileGoal;
  readonly targetWeightKg: number | null;
  readonly lastDoctorVisitAt: string | null;
}
