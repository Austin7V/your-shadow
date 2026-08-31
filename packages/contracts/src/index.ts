export const APP_NAME = "Your Shadow" as const;

export type ApiMessage = {
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
  status: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  isAdultConfirmed: boolean;
};

export type RegisterResponse = AuthUser & {
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthUser;

export type CurrentUserResponse = AuthUser;

export const PROFILE_GOALS = [
  "lose_weight",
  "gain_weight",
  "maintain_weight",
  "improve_fitness",
  "general_wellness",
] as const;

export type ProfileGoal = (typeof PROFILE_GOALS)[number];

export type CreateProfileRequest = {
  firstName: string;
  lastName: string;
  userName: string;
  dateOfBirth: string;
  heightCm: number;
  timezone: string;
  primaryGoal: ProfileGoal;
  targetWeightKg: number | null;
  lastDoctorVisitAt: string | null;
};

export type CreateWeightEntryRequest = {
  weightKg: number;
  measuredAt?: string;
};

export const HEALTH_CONSTRAINT_TYPES = [
  "chronic_condition",
  "injury",
  "allergy",
  "mobility_limitation",
  "medical_restriction",
  "other",
] as const;

export type HealthConstraintType =
    (typeof HEALTH_CONSTRAINT_TYPES)[number];

export const HEALTH_CONSTRAINT_SEVERITIES = [
  "low",
  "moderate",
  "high",
] as const;

export type HealthConstraintSeverity =
    (typeof HEALTH_CONSTRAINT_SEVERITIES)[number];

export type CreateHealthConstraintRequest = {
  type: HealthConstraintType;
  title: string;
  notes: string | null;
  severity: HealthConstraintSeverity;
};