import { Injectable, Logger } from '@nestjs/common';

import { AiCapability, type AiUsageMetadata } from '../ai-provider.contract';

export interface SafeAiUsageRecord {
  readonly event: 'ai_provider_usage';
  readonly capability: AiCapability;
  readonly provider: AiUsageMetadata['provider'];
  readonly model: string;
  readonly providerRequestId?: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
  readonly durationMs: number;
}

export function createSafeAiUsageRecord(
  capability: AiCapability,
  usage: AiUsageMetadata,
): SafeAiUsageRecord {
  return {
    event: 'ai_provider_usage',
    capability,
    provider: usage.provider,
    model: usage.model,
    providerRequestId: usage.providerRequestId,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    durationMs: usage.durationMs,
  };
}

@Injectable()
export class AiUsageRecorderService {
  private readonly logger = new Logger(AiUsageRecorderService.name);

  record(capability: AiCapability, usage: AiUsageMetadata): void {
    this.logger.log(createSafeAiUsageRecord(capability, usage));
  }
}
