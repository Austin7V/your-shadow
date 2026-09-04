import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AiCapabilityConfig } from './ai-capability.config';
import { AI_PROVIDER, AiProvider } from './ai-provider.contract';
import { DisabledAiProvider } from './providers/disabled-ai.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { OPENAI_CLIENT } from './tokens/openai-client.token';

export function selectAiProvider(
  providerName: string,
  openAiProvider: OpenAiProvider,
  disabledAiProvider: DisabledAiProvider,
): AiProvider {
  if (providerName === 'openai') {
    return openAiProvider;
  }

  if (providerName === 'disabled') {
    return disabledAiProvider;
  }

  throw new Error(`Unsupported AI provider: ${providerName}`);
}

@Module({
  imports: [ConfigModule],
  providers: [
    AiCapabilityConfig,
    DisabledAiProvider,
    OpenAiProvider,
    {
      provide: OPENAI_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): OpenAI | null => {
        if (configService.get<string>('AI_PROVIDER', 'disabled') !== 'openai') {
          return null;
        }

        return new OpenAI({
          apiKey: configService.getOrThrow<string>('OPENAI_API_KEY'),
          timeout: configService.get<number>('OPENAI_TIMEOUT_MS', 10_000),
          maxRetries: 0,
        });
      },
    },
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, OpenAiProvider, DisabledAiProvider],
      useFactory: (
        configService: ConfigService,
        openAiProvider: OpenAiProvider,
        disabledAiProvider: DisabledAiProvider,
      ): AiProvider =>
        selectAiProvider(
          configService.get<string>('AI_PROVIDER', 'disabled'),
          openAiProvider,
          disabledAiProvider,
        ),
    },
  ],
  exports: [AI_PROVIDER, AiCapabilityConfig],
})
export class AiModule {}
