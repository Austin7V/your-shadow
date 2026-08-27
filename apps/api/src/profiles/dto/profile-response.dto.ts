import { ProfileGoal } from '../enums/profile-goal.enum';

export class ProfileResponseDto {
  readonly id!: string;
  readonly firstName!: string;
  readonly lastName!: string;
  readonly userName!: string;
  readonly dateOfBirth!: string;
  readonly heightCm!: number;
  readonly timezone!: string;
  readonly primaryGoal!: ProfileGoal;
  readonly targetWeightKg!: number | null;
  readonly lastDoctorVisitAt!: string | null;
  readonly onboardingCompletedAt!: string | null;
  readonly createdAt!: string;
  readonly updatedAt!: string;
}
