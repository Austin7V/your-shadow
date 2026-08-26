const MINIMUM_AGE = 18;
const MAXIMUM_AGE = 120;

const parseDateOfBirth = (value: unknown): Date | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateParts === null) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = dateParts;

  if (
    yearValue === undefined ||
    monthValue === undefined ||
    dayValue === undefined
  ) {
    return null;
  }

  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  const date = new Date(Date.UTC(year, month - 1, day));

  const isValidCalendarDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValidCalendarDate ? date : null;
};

export const isAdultDate = (
  value: unknown,
  referenceDate = new Date(),
): boolean => {
  const dateOfBirth = parseDateOfBirth(value);

  if (dateOfBirth === null) {
    return false;
  }

  let age = referenceDate.getUTCFullYear() - dateOfBirth.getUTCFullYear();

  const currentMonth = referenceDate.getUTCMonth();
  const birthMonth = dateOfBirth.getUTCMonth();

  const birthdayHasNotOccurred =
    currentMonth < birthMonth ||
    (currentMonth === birthMonth &&
      referenceDate.getUTCDate() < dateOfBirth.getUTCDate());

  if (birthdayHasNotOccurred) {
    age -= 1;
  }

  return age >= MINIMUM_AGE && age <= MAXIMUM_AGE;
};

export const isNotFutureDate = (
  value: unknown,
  referenceDate = new Date(),
): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() <= referenceDate.getTime();
};
