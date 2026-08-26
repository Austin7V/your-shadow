import { isAdultDate, isNotFutureDate } from './profile-date.validators';

describe('profile date validators', () => {
  const referenceDate = new Date('2026-08-26T12:00:00.000Z');

  describe('isAdultDate', () => {
    it('accepts a person who is exactly 18 years old', () => {
      expect(isAdultDate('2008-08-26', referenceDate)).toBe(true);
    });

    it('rejects a person who is not yet 18 years old', () => {
      expect(isAdultDate('2008-08-27', referenceDate)).toBe(false);
    });

    it('accepts a person who is 120 years old', () => {
      expect(isAdultDate('1906-08-26', referenceDate)).toBe(true);
    });

    it('rejects a person older than 120 years', () => {
      expect(isAdultDate('1905-08-26', referenceDate)).toBe(false);
    });

    it('rejects an invalid calendar date', () => {
      expect(isAdultDate('2000-02-30', referenceDate)).toBe(false);
    });

    it('rejects an invalid date format', () => {
      expect(isAdultDate('26.08.2000', referenceDate)).toBe(false);
    });
  });

  describe('isNotFutureDate', () => {
    it('accepts a past date', () => {
      expect(isNotFutureDate('2026-08-25T12:00:00.000Z', referenceDate)).toBe(
        true,
      );
    });

    it('accepts the current date and time', () => {
      expect(isNotFutureDate('2026-08-26T12:00:00.000Z', referenceDate)).toBe(
        true,
      );
    });

    it('rejects a future date', () => {
      expect(isNotFutureDate('2026-08-27T12:00:00.000Z', referenceDate)).toBe(
        false,
      );
    });

    it('rejects an invalid date', () => {
      expect(isNotFutureDate('invalid-date', referenceDate)).toBe(false);
    });
  });
});
