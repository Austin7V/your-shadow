import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export const MEAL_PARSING_RATE_LIMIT = {
  maximumRequests: 10,
  windowMilliseconds: 60_000,
  cleanupInterval: 100,
} as const;

@Injectable()
export class MealParsingRateLimitService {
  private readonly requestTimestamps = new Map<string, number[]>();
  private requestsSinceCleanup = 0;

  consume(userId: string, now = Date.now()): void {
    const windowStart = now - MEAL_PARSING_RATE_LIMIT.windowMilliseconds;
    const activeTimestamps = (this.requestTimestamps.get(userId) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (activeTimestamps.length >= MEAL_PARSING_RATE_LIMIT.maximumRequests) {
      throw new HttpException(
        'Too many meal parsing requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    activeTimestamps.push(now);
    this.requestTimestamps.set(userId, activeTimestamps);

    this.requestsSinceCleanup += 1;

    if (this.requestsSinceCleanup >= MEAL_PARSING_RATE_LIMIT.cleanupInterval) {
      this.removeExpiredEntries(windowStart);
      this.requestsSinceCleanup = 0;
    }
  }

  private removeExpiredEntries(windowStart: number): void {
    for (const [userId, timestamps] of this.requestTimestamps) {
      const activeTimestamps = timestamps.filter(
        (timestamp) => timestamp > windowStart,
      );

      if (activeTimestamps.length === 0) {
        this.requestTimestamps.delete(userId);
        continue;
      }

      this.requestTimestamps.set(userId, activeTimestamps);
    }
  }
}
