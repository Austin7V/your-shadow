export enum SafetyAction {
  Allow = 'allow',
  Limit = 'limit',
  Block = 'block',
  Stop = 'stop',
  Refer = 'refer',
}

export enum SafetyCode {
  ActiveHealthConstraint = 'active_health_constraint',
  ActiveMedicalRestriction = 'active_medical_restriction',
  PainDuringActivity = 'pain_during_activity',
  ChestPain = 'chest_pain',
  SevereBreathingDifficulty = 'severe_breathing_difficulty',
  FaintingDuringActivity = 'fainting_during_activity',
  UnrecognizedSignal = 'unrecognized_signal',
}

export type SafetyCategory =
  'profile_constraint' | 'activity_stop' | 'urgent_symptom' | 'system';

export type SafetyCatalogReviewStatus = 'pending_expert_review' | 'approved';

export interface SafetyCatalogEntry {
  code: SafetyCode;
  category: SafetyCategory;
  action: SafetyAction;
  userMessage: string;
}

export interface SafetyDecision {
  catalogVersion: number;
  catalogReviewStatus: SafetyCatalogReviewStatus;
  action: SafetyAction;
  shouldGenerate: boolean;
  matchedCodes: readonly SafetyCode[];
  userMessages: readonly string[];
}
