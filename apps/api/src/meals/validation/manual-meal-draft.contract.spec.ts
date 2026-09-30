import { manualMealDraftSchema } from '@your-shadow/contracts';

describe('manualMealDraftSchema', () => {
  const validDraft = {
    originalText: 'A bowl of soup',
    nutrition: {
      caloriesKcal: 250,
      proteinGrams: 10,
      fatGrams: 8,
      carbohydratesGrams: 32,
    },
  };

  it('accepts a completed manual draft', () => {
    expect(manualMealDraftSchema.parse(validDraft)).toEqual(validDraft);
  });

  it.each([
    ['blank description', { ...validDraft, originalText: '   ' }],
    [
      'missing calories',
      {
        ...validDraft,
        nutrition: {
          proteinGrams: 10,
          fatGrams: 8,
          carbohydratesGrams: 32,
        },
      },
    ],
    [
      'unfilled calories',
      {
        ...validDraft,
        nutrition: { ...validDraft.nutrition, caloriesKcal: null },
      },
    ],
    [
      'negative fat',
      {
        ...validDraft,
        nutrition: { ...validDraft.nutrition, fatGrams: -1 },
      },
    ],
    [
      'excessive calories',
      {
        ...validDraft,
        nutrition: { ...validDraft.nutrition, caloriesKcal: 5_001 },
      },
    ],
    ['unexpected user ID', { ...validDraft, userId: 'someone-else' }],
  ])('rejects %s', (_caseName, draft) => {
    expect(manualMealDraftSchema.safeParse(draft).success).toBe(false);
  });
});
