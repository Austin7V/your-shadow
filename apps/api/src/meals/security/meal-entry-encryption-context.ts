export function createMealEntryEncryptionContext(
  userId: string,
  mealEntryId: string,
): string {
  return `meal-entry:${userId}:${mealEntryId}`;
}
