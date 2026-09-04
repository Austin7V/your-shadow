import { ConfigService } from '@nestjs/config';
import { APIConnectionTimeoutError, APIError } from 'openai/error';
import type {
  Response,
  ResponseCreateParamsNonStreaming,
} from 'openai/resources/responses/responses';

import { AiCapabilityConfig } from '../ai-capability.config';
import { AiCapability } from '../ai-provider.contract';
import { AiProviderErrorCode } from '../ai-provider.error';
import { OpenAiProvider, OpenAiResponsesClient } from './openai.provider';

describe('OpenAiProvider', () => {
  const request = {
    capability: AiCapability.DailyPlan,
    instructions: 'Create a safe daily plan.',
    input: 'Minimal permitted context',
  };

  const createResponse = (overrides: Partial<Response> = {}): Response =>
    ({
      id: 'resp_test_123',
      status: 'completed',
      output_text: 'A concise plan',
      output: [],
      usage: {
        input_tokens: 25,
        output_tokens: 10,
        total_tokens: 35,
        input_tokens_details: {
          cached_tokens: 0,
          cache_write_tokens: 0,
        },
        output_tokens_details: {
          reasoning_tokens: 0,
        },
      },
      ...overrides,
    }) as Response;

  const createProvider = (
    responseOrError: Response | Error,
  ): {
    provider: OpenAiProvider;
    create: jest.Mock<Promise<Response>, [ResponseCreateParamsNonStreaming]>;
  } => {
    const create = jest.fn<
      Promise<Response>,
      [ResponseCreateParamsNonStreaming]
    >();

    if (responseOrError instanceof Error) {
      create.mockRejectedValue(responseOrError);
    } else {
      create.mockResolvedValue(responseOrError);
    }

    const client: OpenAiResponsesClient = {
      responses: {
        create,
      },
    };

    const capabilityConfig = new AiCapabilityConfig(new ConfigService());

    return {
      provider: new OpenAiProvider(capabilityConfig, client),
      create,
    };
  };

  it('generates text without enabling storage or tools', async () => {
    const { provider, create } = createProvider(createResponse());

    const result = await provider.generateText(request);

    expect(result).toMatchObject({
      output: 'A concise plan',
      usage: {
        provider: 'openai',
        model: 'gpt-5.6-terra',
        providerRequestId: 'resp_test_123',
        inputTokens: 25,
        outputTokens: 10,
        totalTokens: 35,
      },
    });

    expect(create).toHaveBeenCalledWith({
      model: 'gpt-5.6-terra',
      instructions: request.instructions,
      input: request.input,
      max_output_tokens: 800,
      store: false,
      tools: [],
      truncation: 'disabled',
      text: {
        verbosity: 'low',
      },
    });
  });

  it('generates and parses strict structured output', async () => {
    const { provider, create } = createProvider(
      createResponse({
        output_text: '{"actions":[]}',
      }),
    );

    const schema = {
      type: 'object',
      properties: {
        actions: {
          type: 'array',
        },
      },
      required: ['actions'],
      additionalProperties: false,
    };

    const result = await provider.generateStructured<{
      actions: unknown[];
    }>({
      ...request,
      responseFormat: {
        name: 'daily_plan_v1',
        schema,
      },
    });

    expect(result.output).toEqual({
      actions: [],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'daily_plan_v1',
            schema,
            strict: true,
          },
        },
      }),
    );
  });

  it('rejects input that exceeds the capability limit before a provider call', async () => {
    const { provider, create } = createProvider(createResponse());

    await expect(
      provider.generateText({
        ...request,
        input: 'a'.repeat(12_001),
      }),
    ).rejects.toMatchObject({
      code: AiProviderErrorCode.InvalidRequest,
      retryable: false,
    });

    expect(create).not.toHaveBeenCalled();
  });

  it('normalizes invalid structured output', async () => {
    const { provider } = createProvider(
      createResponse({
        output_text: 'not-json',
      }),
    );

    await expect(
      provider.generateStructured({
        ...request,
        responseFormat: {
          name: 'daily_plan_v1',
          schema: {
            type: 'object',
          },
        },
      }),
    ).rejects.toMatchObject({
      code: AiProviderErrorCode.InvalidResponse,
      retryable: false,
    });
  });

  it('normalizes an explicit model refusal', async () => {
    const { provider } = createProvider(
      createResponse({
        output_text: '',
        output: [
          {
            id: 'message_123',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'refusal',
                refusal: 'Cannot answer.',
              },
            ],
          },
        ],
      }),
    );

    await expect(provider.generateText(request)).rejects.toMatchObject({
      code: AiProviderErrorCode.ContentRefused,
      retryable: false,
    });
  });

  it('normalizes provider timeouts', async () => {
    const { provider } = createProvider(
      new APIConnectionTimeoutError({
        message: 'private SDK details',
      }),
    );

    await expect(provider.generateText(request)).rejects.toMatchObject({
      code: AiProviderErrorCode.Timeout,
      message: 'AI provider request timed out',
      retryable: true,
    });
  });

  it.each([
    [401, AiProviderErrorCode.AuthenticationFailed, false],
    [429, AiProviderErrorCode.RateLimited, true],
    [500, AiProviderErrorCode.Unavailable, true],
  ])(
    'normalizes HTTP status %s',
    async (status, expectedCode, expectedRetryable) => {
      const providerError = APIError.generate(
        status,
        undefined,
        'private SDK details',
        new Headers(),
      );

      const { provider } = createProvider(providerError);

      await expect(provider.generateText(request)).rejects.toMatchObject({
        code: expectedCode,
        retryable: expectedRetryable,
      });
    },
  );
});
