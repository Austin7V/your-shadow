import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { AI_PROVIDER, AiProvider } from './ai-provider.contract';
import { AiModule, selectAiProvider } from './ai.module';
import { DisabledAiProvider } from './providers/disabled-ai.provider';
import { OpenAiProvider } from './providers/openai.provider';

describe('selectAiProvider', () => {
  const openAiProvider = {} as OpenAiProvider;
  const disabledAiProvider = {} as DisabledAiProvider;

  it('selects OpenAI through configuration', () => {
    expect(
      selectAiProvider('openai', openAiProvider, disabledAiProvider),
    ).toBe<AiProvider>(openAiProvider);
  });

  it('selects the disabled provider through configuration', () => {
    expect(
      selectAiProvider('disabled', openAiProvider, disabledAiProvider),
    ).toBe<AiProvider>(disabledAiProvider);
  });

  it('rejects an unsupported provider', () => {
    expect(() =>
      selectAiProvider('unsupported', openAiProvider, disabledAiProvider),
    ).toThrow('Unsupported AI provider: unsupported');
  });

  it('wires the disabled provider through the NestJS module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AiModule],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ AI_PROVIDER: 'disabled' }))
      .compile();

    expect(moduleRef.get<AiProvider>(AI_PROVIDER)).toBeInstanceOf(
      DisabledAiProvider,
    );

    await moduleRef.close();
  });

  it('wires the OpenAI provider through the NestJS module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AiModule],
    })
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          AI_PROVIDER: 'openai',
          OPENAI_API_KEY: 'test-openai-api-key-with-safe-length',
          OPENAI_TIMEOUT_MS: 10_000,
        }),
      )
      .compile();

    expect(moduleRef.get<AiProvider>(AI_PROVIDER)).toBeInstanceOf(
      OpenAiProvider,
    );

    await moduleRef.close();
  });
});
