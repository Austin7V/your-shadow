import { LocalDateService } from './local-date.service';

describe('LocalDateService', () => {
  let service: LocalDateService;

  beforeEach(() => {
    service = new LocalDateService();
  });

  it('resolves different local dates for the same instant', () => {
    const instant = new Date('2026-09-07T22:30:00.000Z');

    expect(service.resolveLocalDate('Europe/Berlin', instant)).toBe(
      '2026-09-08',
    );

    expect(service.resolveLocalDate('America/New_York', instant)).toBe(
      '2026-09-07',
    );
  });

  it('keeps the current date immediately before local midnight', () => {
    const instant = new Date('2026-09-07T21:59:59.999Z');

    expect(service.resolveLocalDate('Europe/Berlin', instant)).toBe(
      '2026-09-07',
    );
  });

  it('changes the date exactly at local midnight', () => {
    const instant = new Date('2026-09-07T22:00:00.000Z');

    expect(service.resolveLocalDate('Europe/Berlin', instant)).toBe(
      '2026-09-08',
    );
  });

  it('rejects invalid timezone and instant values', () => {
    expect(() =>
      service.resolveLocalDate(
        'Invalid/Timezone',
        new Date('2026-09-07T22:00:00.000Z'),
      ),
    ).toThrow(RangeError);

    expect(() =>
      service.resolveLocalDate('Europe/Berlin', new Date('invalid')),
    ).toThrow('Invalid instant');
  });
});
