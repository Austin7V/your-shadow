import {
  AiGenerationResult,
  AiProvider,
  AiStructuredGenerationRequest,
  AiTextGenerationRequest,
} from '../ai-provider.contract';
import { AiProviderError, AiProviderErrorCode } from '../ai-provider.error';

type QueuedFakeResponse = AiGenerationResult<unknown> | AiProviderError;

export class FakeAiProvider implements AiProvider {
  readonly textRequests: AiTextGenerationRequest[] = [];
  readonly structuredRequests: AiStructuredGenerationRequest[] = [];

  private readonly responses: QueuedFakeResponse[] = [];

  enqueueResult<TOutput>(output: TOutput): void {
    this.responses.push({
      output,
      usage: {
        provider: 'fake',
        model: 'fake-model',
        durationMs: 0,
      },
    });
  }

  enqueueError(error: AiProviderError): void {
    this.responses.push(error);
  }

  generateText(
    request: AiTextGenerationRequest,
  ): Promise<AiGenerationResult<string>> {
    this.textRequests.push(request);
    return Promise.resolve().then(() => this.takeResponse<string>());
  }

  generateStructured<TOutput>(
    request: AiStructuredGenerationRequest,
  ): Promise<AiGenerationResult<TOutput>> {
    this.structuredRequests.push(request);
    return Promise.resolve().then(() => this.takeResponse<TOutput>());
  }

  private takeResponse<TOutput>(): AiGenerationResult<TOutput> {
    const response = this.responses.shift();

    if (response === undefined) {
      throw new AiProviderError(
        AiProviderErrorCode.Unknown,
        'Fake AI provider has no queued response',
        false,
      );
    }

    if (response instanceof AiProviderError) {
      throw response;
    }

    return response as AiGenerationResult<TOutput>;
  }
}
