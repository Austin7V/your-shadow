import { Injectable } from '@nestjs/common';

import {
  SAFETY_CATALOG,
  SAFETY_CATALOG_REVIEW_STATUS,
  SAFETY_CATALOG_VERSION,
} from './safety.catalog';
import { SafetyAction, SafetyCode, type SafetyDecision } from './safety.types';

const SAFETY_ACTION_PRIORITY: Record<SafetyAction, number> = {
  [SafetyAction.Allow]: 0,
  [SafetyAction.Limit]: 1,
  [SafetyAction.Block]: 2,
  [SafetyAction.Stop]: 3,
  [SafetyAction.Refer]: 4,
};

const SAFETY_CODE_VALUES = new Set<string>(Object.values(SafetyCode));

function isSafetyCode(value: string): value is SafetyCode {
  return SAFETY_CODE_VALUES.has(value);
}

function resolveSafetyCode(value: string): SafetyCode {
  return isSafetyCode(value) ? value : SafetyCode.UnrecognizedSignal;
}

@Injectable()
export class SafetyRuleService {
  evaluateBeforeGeneration(reportedCodes: readonly string[]): SafetyDecision {
    const matchedCodes = [...new Set(reportedCodes.map(resolveSafetyCode))];

    const entries = matchedCodes.map((code) => SAFETY_CATALOG[code]);

    const action = entries.reduce<SafetyAction>(
      (currentAction, entry) =>
        SAFETY_ACTION_PRIORITY[entry.action] >
        SAFETY_ACTION_PRIORITY[currentAction]
          ? entry.action
          : currentAction,
      SafetyAction.Allow,
    );

    return {
      catalogVersion: SAFETY_CATALOG_VERSION,
      catalogReviewStatus: SAFETY_CATALOG_REVIEW_STATUS,
      action,
      shouldGenerate:
        action === SafetyAction.Allow || action === SafetyAction.Limit,
      matchedCodes,
      userMessages: entries.map((entry) => entry.userMessage),
    };
  }
}
