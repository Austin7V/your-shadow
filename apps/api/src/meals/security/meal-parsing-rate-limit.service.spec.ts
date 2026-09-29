import { HttpException, HttpStatus } from '@nestjs/common';

import {
  MEAL_PARSING_RATE_LIMIT,
  MealParsingRateLimitService,
} from './meal-parsing-rate-limit.service';

describe('MealParsingRateLimitService', () => {
  let service: MealParsingRateLimitService;

  beforeEach(() => {
    service = new MealParsingRateLimitService();
  });

  it('allows requests up to the configured limit', () => {
    const now = 1_000_000;

    expect(() => {
      for (
        let requestNumber = 0;
        requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
        requestNumber += 1
      ) {
        service.consume('user-1', now);
      }
    }).not.toThrow();
  });

  it('rejects requests above the configured limit', () => {
    const now = 1_000_000;

    for (
      let requestNumber = 0;
      requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
      requestNumber += 1
    ) {
      service.consume('user-1', now);
    }

    let thrownError: unknown;

    try {
      service.consume('user-1', now);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(HttpException);

    if (!(thrownError instanceof HttpException)) {
      throw new Error('Expected an HttpException');
    }

    expect(thrownError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(thrownError.message).toBe(
      'Too many meal parsing requests. Please try again later.',
    );
  });

  it('tracks limits independently for each user', () => {
    const now = 1_000_000;

    for (
      let requestNumber = 0;
      requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
      requestNumber += 1
    ) {
      service.consume('user-1', now);
    }

    expect(() => service.consume('user-2', now)).not.toThrow();
  });

  it('allows requests after the sliding window expires', () => {
    const now = 1_000_000;

    for (
      let requestNumber = 0;
      requestNumber < MEAL_PARSING_RATE_LIMIT.maximumRequests;
      requestNumber += 1
    ) {
      service.consume('user-1', now);
    }

    expect(() =>
      service.consume(
        'user-1',
        now + MEAL_PARSING_RATE_LIMIT.windowMilliseconds,
      ),
    ).not.toThrow();
  });
});
