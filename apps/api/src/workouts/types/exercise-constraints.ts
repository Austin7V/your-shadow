export type ExerciseConstraintCode =
  | 'shoulder-pain'
  | 'wrist-pain'
  | 'knee-pain'
  | 'lower-back-pain'
  | 'balance-issues'
  | 'high-impact'
  | 'joint-pain'
  | 'back-pain'
  | 'strength';

export const VALID_CONSTRAINT_CODES = new Set<ExerciseConstraintCode>([
  'shoulder-pain',
  'wrist-pain',
  'knee-pain',
  'lower-back-pain',
  'balance-issues',
  'high-impact',
  'joint-pain',
  'back-pain',
  'strength',
]);

export interface ExerciseSafetyMetadata {
  constraintCodes: ExerciseConstraintCode[];
  allowedReplacements: string[];
  notes?: string;
}
