import { AiCapability } from '../ai-provider.contract';
import { AiProviderErrorCode } from '../ai-provider.error';
import { DisabledAiProvider } from './disabled-ai.provider';

describe('DisabledAiProvider', () => {
  const request = {
    capability: AiCapability.DailyPlan,
    instructions: 'Create a daily plan.',
    input: 'Minimal permitted context',
  };

  it('returns a normalized disabled error for text generation', async () => {
    const provider = new DisabledAiProvider();

    await expect(provider.generateText(request)).rejects.toMatchObject({
      code: AiProviderErrorCode.Disabled,
      retryable: false,
    });
  });

  it('returns a normalized disabled error for structured generation', async () => {
    const provider = new DisabledAiProvider();

    await expect(
      provider.generateStructured({
        ...request,
        responseFormat: {
          name: 'daily_plan',
          schema: { type: 'object' },
        },
      }),
    ).rejects.toMatchObject({
      code: AiProviderErrorCode.Disabled,
      retryable: false,
    });
  });
});
