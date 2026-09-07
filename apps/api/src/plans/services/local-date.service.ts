import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalDateService {
  resolveLocalDate(timezone: string, instant: Date = new Date()): string {
    if (Number.isNaN(instant.getTime())) {
      throw new RangeError('Invalid instant');
    }

    const formatter = new Intl.DateTimeFormat('en-CA', {
      calendar: 'iso8601',
      numberingSystem: 'latn',
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = new Map(
      formatter.formatToParts(instant).map((part) => [part.type, part.value]),
    );

    const year = parts.get('year');
    const month = parts.get('month');
    const day = parts.get('day');

    if (year === undefined || month === undefined || day === undefined) {
      throw new Error('Failed to resolve local date');
    }

    return `${year}-${month}-${day}`;
  }
}
