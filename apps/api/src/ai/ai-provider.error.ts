export enum AiProviderErrorCode {
  Disabled = 'disabled',
  Timeout = 'timeout',
  RateLimited = 'rate_limited',
  AuthenticationFailed = 'authentication_failed',
  InvalidRequest = 'invalid_request',
  Unavailable = 'unavailable',
  InvalidResponse = 'invalid_response',
  ContentRefused = 'content_refused',
  Unknown = 'unknown',
}

export class AiProviderError extends Error {
  constructor(
    public readonly code: AiProviderErrorCode,
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = AiProviderError.name;
  }
}
