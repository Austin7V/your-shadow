import {
  SafetyAction,
  SafetyCode,
  type SafetyCatalogEntry,
  type SafetyCatalogReviewStatus,
} from './safety.types';

export const SAFETY_CATALOG_VERSION = 1 as const;

export const SAFETY_CATALOG_REVIEW_STATUS =
  'pending_expert_review' satisfies SafetyCatalogReviewStatus;

export const SAFETY_CATALOG_PUBLIC_LAUNCH_APPROVED = false as const;

export const SAFETY_CATALOG = {
  [SafetyCode.ActiveHealthConstraint]: {
    code: SafetyCode.ActiveHealthConstraint,
    category: 'profile_constraint',
    action: SafetyAction.Limit,
    userMessage:
      'We will adjust your recommendations to respect your active health constraints.',
  },
  [SafetyCode.ActiveMedicalRestriction]: {
    code: SafetyCode.ActiveMedicalRestriction,
    category: 'profile_constraint',
    action: SafetyAction.Block,
    userMessage:
      'Recommendations affected by your medical restriction are paused. Follow the guidance from your healthcare professional.',
  },
  [SafetyCode.PainDuringActivity]: {
    code: SafetyCode.PainDuringActivity,
    category: 'activity_stop',
    action: SafetyAction.Stop,
    userMessage:
      'Stop the activity and do not continue through pain. Seek medical help if the pain is severe, sudden, or does not improve.',
  },
  [SafetyCode.ChestPain]: {
    code: SafetyCode.ChestPain,
    category: 'urgent_symptom',
    action: SafetyAction.Refer,
    userMessage:
      'Stop the activity and seek urgent medical help now. Your Shadow cannot assess chest pain.',
  },
  [SafetyCode.SevereBreathingDifficulty]: {
    code: SafetyCode.SevereBreathingDifficulty,
    category: 'urgent_symptom',
    action: SafetyAction.Refer,
    userMessage:
      'Stop the activity and contact your local emergency service now. Your Shadow cannot assess severe breathing difficulty.',
  },
  [SafetyCode.FaintingDuringActivity]: {
    code: SafetyCode.FaintingDuringActivity,
    category: 'urgent_symptom',
    action: SafetyAction.Refer,
    userMessage:
      'Stop the activity and seek urgent medical help now. Fainting during activity requires prompt professional assessment.',
  },
  [SafetyCode.UnrecognizedSignal]: {
    code: SafetyCode.UnrecognizedSignal,
    category: 'system',
    action: SafetyAction.Block,
    userMessage:
      'We could not verify the safety information, so normal recommendations are paused.',
  },
} satisfies Record<SafetyCode, SafetyCatalogEntry>;
