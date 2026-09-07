import {
  SAFETY_CATALOG,
  SAFETY_CATALOG_PUBLIC_LAUNCH_APPROVED,
  SAFETY_CATALOG_REVIEW_STATUS,
  SAFETY_CATALOG_VERSION,
} from './safety.catalog';
import { SafetyRuleService } from './safety-rule.service';
import { SafetyAction, SafetyCode } from './safety.types';

describe('SafetyRuleService', () => {
  const service = new SafetyRuleService();

  it('defines an action and a user-facing message for every code', () => {
    for (const code of Object.values(SafetyCode)) {
      const entry = SAFETY_CATALOG[code];

      expect(entry.code).toBe(code);
      expect(Object.values(SafetyAction)).toContain(entry.action);
      expect(entry.userMessage.trim().length).toBeGreaterThan(0);
    }

    expect(SAFETY_CATALOG_VERSION).toBe(1);
    expect(SAFETY_CATALOG_REVIEW_STATUS).toBe('pending_expert_review');
    expect(SAFETY_CATALOG_PUBLIC_LAUNCH_APPROVED).toBe(false);
  });

  it('allows generation when no safety signal is present', () => {
    expect(service.evaluateBeforeGeneration([])).toEqual({
      catalogVersion: 1,
      catalogReviewStatus: 'pending_expert_review',
      action: SafetyAction.Allow,
      shouldGenerate: true,
      matchedCodes: [],
      userMessages: [],
    });
  });

  it('allows limited generation for an active health constraint', () => {
    const decision = service.evaluateBeforeGeneration([
      SafetyCode.ActiveHealthConstraint,
    ]);

    expect(decision.action).toBe(SafetyAction.Limit);
    expect(decision.shouldGenerate).toBe(true);
    expect(decision.matchedCodes).toEqual([SafetyCode.ActiveHealthConstraint]);
  });

  it('stops normal generation after pain during activity', () => {
    const decision = service.evaluateBeforeGeneration([
      SafetyCode.PainDuringActivity,
    ]);

    expect(decision.action).toBe(SafetyAction.Stop);
    expect(decision.shouldGenerate).toBe(false);
    expect(decision.userMessages).toHaveLength(1);
  });

  it('gives urgent referral priority over less restrictive actions', () => {
    const decision = service.evaluateBeforeGeneration([
      SafetyCode.ActiveHealthConstraint,
      SafetyCode.PainDuringActivity,
      SafetyCode.ChestPain,
    ]);

    expect(decision.action).toBe(SafetyAction.Refer);
    expect(decision.shouldGenerate).toBe(false);
    expect(decision.matchedCodes).toEqual([
      SafetyCode.ActiveHealthConstraint,
      SafetyCode.PainDuringActivity,
      SafetyCode.ChestPain,
    ]);
  });

  it('blocks generation for an unrecognized runtime signal', () => {
    const decision = service.evaluateBeforeGeneration([
      'unexpected_safety_signal',
    ]);

    expect(decision.action).toBe(SafetyAction.Block);
    expect(decision.shouldGenerate).toBe(false);
    expect(decision.matchedCodes).toEqual([SafetyCode.UnrecognizedSignal]);
  });
});
