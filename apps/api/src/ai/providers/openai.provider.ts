import { Inject, Injectable } from '@nestjs/common';
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
} from 'openai/error';
import type {
  Response,
  ResponseCreateParamsNonStreaming,
} from 'openai/resources/responses/responses';

import { AiCapabilityConfig } from '../ai-capability.config';
import {
  AiGenerationResult,
  AiProvider,
  AiStructuredGenerationRequest,
  AiTextGenerationRequest,
  AiUsageMetadata,
} from '../ai-provider.contract';
import { AiProviderError, AiProviderErrorCode } from '../ai-provider.error';
import { OPENAI_CLIENT } from '../tokens/openai-client.token';

export interface OpenAiResponsesClient {
  responses: {
    create(parameters: ResponseCreateParamsNonStreaming): Promise<Response>;
  };
}

@Injectable()
export class OpenAiProvider implements AiProvider {
  constructor(
    private readonly capabilityConfig: AiCapabilityConfig,
    @Inject(OPENAI_CLIENT)
    private readonly client: OpenAiResponsesClient | null,
  ) {}

  async generateText(
    request: AiTextGenerationRequest,
  ): Promise<AiGenerationResult<string>> {
    return this.generate(request);
  }

  async generateStructured<TOutput>(
    request: AiStructuredGenerationRequest,
  ): Promise<AiGenerationResult<TOutput>> {
    const result = await this.generate(request, {
      format: {
        type: 'json_schema',
        name: request.responseFormat.name,
        schema: request.responseFormat.schema,
        strict: true,
      },
      verbosity: 'low',
    });

    try {
      return {
        ...result,
        output: JSON.parse(result.output) as TOutput,
      };
    } catch {
      throw new AiProviderError(
        AiProviderErrorCode.InvalidResponse,
        'AI provider returned invalid structured output',
        false,
      );
    }
  }

  private async generate(
    request: AiTextGenerationRequest,
    text: ResponseCreateParamsNonStreaming['text'] = { verbosity: 'low' },
  ): Promise<AiGenerationResult<string>> {
    if (this.client === null) {
      throw new AiProviderError(
        AiProviderErrorCode.Disabled,
        'AI generation is disabled',
        false,
      );
    }

    const configuration = this.capabilityConfig.get(request.capability);

    if (request.input.length > configuration.maxInputCharacters) {
      throw new AiProviderError(
        AiProviderErrorCode.InvalidRequest,
        'AI input exceeds the capability limit',
        false,
      );
    }

    const startedAt = performance.now();

    try {
      const response = await this.client.responses.create({
        model: configuration.model,
        instructions: request.instructions,
        input: request.input,
        max_output_tokens: configuration.maxOutputTokens,

        store: false,
        tools: [],
        truncation: 'disabled',
        text,
      });

      if (response.status !== undefined && response.status !== 'completed') {
        throw new AiProviderError(
          AiProviderErrorCode.InvalidResponse,
          'AI provider did not complete the response',
          false,
        );
      }

      const output = response.output_text.trim();

      if (output.length === 0) {
        const refused = this.hasRefusal(response);

        throw new AiProviderError(
          refused
            ? AiProviderErrorCode.ContentRefused
            : AiProviderErrorCode.InvalidResponse,
          refused
            ? 'AI provider refused the request'
            : 'AI provider returned an empty response',
          false,
        );
      }

      return {
        output,
        usage: this.createUsageMetadata(
          response,
          configuration.model,
          performance.now() - startedAt,
        ),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private createUsageMetadata(
    response: Response,
    model: string,
    durationMs: number,
  ): AiUsageMetadata {
    return {
      provider: 'openai',
      model,
      providerRequestId: response.id,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      totalTokens: response.usage?.total_tokens,
      durationMs: Math.round(durationMs),
    };
  }

  private hasRefusal(response: Response): boolean {
    return response.output.some(
      (item) =>
        item.type === 'message' &&
        item.content.some((content) => content.type === 'refusal'),
    );
  }

  private normalizeError(error: unknown): AiProviderError {
    if (error instanceof AiProviderError) {
      return error;
    }

    if (error instanceof APIConnectionTimeoutError) {
      return new AiProviderError(
        AiProviderErrorCode.Timeout,
        'AI provider request timed out',
        true,
      );
    }

    if (error instanceof APIConnectionError) {
      return new AiProviderError(
        AiProviderErrorCode.Unavailable,
        'AI provider is unavailable',
        true,
      );
    }

    if (error instanceof APIError) {
      if (error.status === 401 || error.status === 403) {
        return new AiProviderError(
          AiProviderErrorCode.AuthenticationFailed,
          'AI provider authentication failed',
          false,
        );
      }

      if (error.status === 429) {
        return new AiProviderError(
          AiProviderErrorCode.RateLimited,
          'AI provider rate limit was reached',
          true,
        );
      }

      if (error.status === 400 || error.status === 422) {
        return new AiProviderError(
          AiProviderErrorCode.InvalidRequest,
          'AI provider rejected the request',
          false,
        );
      }

      if (error.status !== undefined && error.status >= 500) {
        return new AiProviderError(
          AiProviderErrorCode.Unavailable,
          'AI provider is unavailable',
          true,
        );
      }
    }

    return new AiProviderError(
      AiProviderErrorCode.Unknown,
      'AI provider request failed',
      false,
    );
  }
}
