import { AiCapability } from '../ai-provider.contract';
import { AiProviderError, AiProviderErrorCode } from '../ai-provider.error';
import { FakeAiProvider } from './fake-ai.provider';

describe('FakeAiProvider', () => {
  const request = {
    capability: AiCapability.DailyPlan,
    instructions: 'Create a daily plan.',
    input: 'Minimal permitted context',
  };

  it('returns queued results and records requests', async () => {
    const provider = new FakeAiProvider();
    provider.enqueueResult({ actions: [] });

    await expect(
      provider.generateStructured<{ actions: unknown[] }>({
        ...request,
        responseFormat: {
          name: 'daily_plan_v1',
          schema: { type: 'object' },
        },
      }),
    ).resolves.toMatchObject({
      output: { actions: [] },
      usage: { provider: 'fake' },
    });
    expect(provider.structuredRequests).toHaveLength(1);
  });

  it('returns queued normalized errors', async () => {
    const provider = new FakeAiProvider();
    provider.enqueueError(
      new AiProviderError(
        AiProviderErrorCode.Timeout,
        'AI provider request timed out',
        true,
      ),
    );

    await expect(provider.generateText(request)).rejects.toMatchObject({
      code: AiProviderErrorCode.Timeout,
      retryable: true,
    });
  });

  it('fails clearly when no response was configured', async () => {
    const provider = new FakeAiProvider();

    await expect(provider.generateText(request)).rejects.toMatchObject({
      code: AiProviderErrorCode.Unknown,
      retryable: false,
    });
  });
});
