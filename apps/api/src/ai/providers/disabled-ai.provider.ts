import { Injectable } from '@nestjs/common';

import {
  AiGenerationResult,
  AiProvider,
  AiStructuredGenerationRequest,
  AiTextGenerationRequest,
} from '../ai-provider.contract';
import { AiProviderError, AiProviderErrorCode } from '../ai-provider.error';

@Injectable()
export class DisabledAiProvider implements AiProvider {
  generateText(
    request: AiTextGenerationRequest,
  ): Promise<AiGenerationResult<string>> {
    void request;
    return Promise.reject(this.createDisabledError());
  }

  generateStructured<TOutput>(
    request: AiStructuredGenerationRequest,
  ): Promise<AiGenerationResult<TOutput>> {
    void request;
    return Promise.reject(this.createDisabledError());
  }

  private createDisabledError(): AiProviderError {
    return new AiProviderError(
      AiProviderErrorCode.Disabled,
      'AI generation is disabled',
      false,
    );
  }
}
