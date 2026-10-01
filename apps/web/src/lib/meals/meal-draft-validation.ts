import {
  manualMealDraftSchema,
  mealDraftFoodSchema,
  mealNutritionTotalsSchema,
  type MealDraftFoodOutput,
  type MealNutritionTotals,
} from "@/lib/contracts";

type NutritionField = keyof MealNutritionTotals;

export type EditableNutrition = Record<NutritionField, string>;

export type EditableFood = Omit<
  MealDraftFoodOutput,
  NutritionField | "quantity"
> & {
  quantity: string;
} & EditableNutrition;

type ValidationResult<T> = {
  value: T | null;
  errors: Record<string, string>;
};

type ValidatedAiFoods = {
  foods: MealDraftFoodOutput[];
  totals: MealNutritionTotals;
};

function parseNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function numericNutrition(values: EditableNutrition) {
  return {
    caloriesKcal: parseNumber(values.caloriesKcal),
    proteinGrams: parseNumber(values.proteinGrams),
    fatGrams: parseNumber(values.fatGrams),
    carbohydratesGrams: parseNumber(values.carbohydratesGrams),
  };
}

export function toEditableNutrition(values: {
  [Field in NutritionField]: number | null;
}): EditableNutrition {
  return {
    caloriesKcal:
      values.caloriesKcal === null ? "" : String(values.caloriesKcal),
    proteinGrams:
      values.proteinGrams === null ? "" : String(values.proteinGrams),
    fatGrams: values.fatGrams === null ? "" : String(values.fatGrams),
    carbohydratesGrams:
      values.carbohydratesGrams === null
        ? ""
        : String(values.carbohydratesGrams),
  };
}

export function toEditableFood(food: MealDraftFoodOutput): EditableFood {
  return {
    ...food,
    quantity: String(food.quantity),
    ...toEditableNutrition(food),
  };
}

export function validateManualDraft(
  originalText: string,
  nutrition: EditableNutrition,
): ValidationResult<{
  originalText: string;
  nutrition: MealNutritionTotals;
}> {
  const parsed = manualMealDraftSchema.safeParse({
    originalText,
    nutrition: numericNutrition(nutrition),
  });

  if (parsed.success) {
    return { value: parsed.data, errors: {} };
  }

  const errors: Record<string, string> = {};

  for (const issue of parsed.error.issues) {
    const field = issue.path.join(".") || "form";
    errors[field] ??= issue.message;
  }

  return { value: null, errors };
}

export function validateAiFoods(
  foods: EditableFood[],
): ValidationResult<ValidatedAiFoods> {
  const errors: Record<string, string> = {};
  const parsedFoods: MealDraftFoodOutput[] = [];

  if (foods.length < 1 || foods.length > 20) {
    errors.foods = "A meal needs between 1 and 20 foods.";
  }

  foods.forEach((food, index) => {
    const parsed = mealDraftFoodSchema.safeParse({
      ...food,
      quantity: parseNumber(food.quantity),
      ...numericNutrition(food),
    });

    if (parsed.success) {
      parsedFoods.push(parsed.data);
      return;
    }

    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "form";
      errors[`foods.${index}.${field}`] ??= issue.message;
    }
  });

  if (Object.keys(errors).length > 0) {
    return { value: null, errors };
  }

  const sum = (field: NutritionField) =>
    parsedFoods.reduce((total, food) => total + food[field], 0);

  const totals = mealNutritionTotalsSchema.safeParse({
    caloriesKcal: sum("caloriesKcal"),
    proteinGrams: sum("proteinGrams"),
    fatGrams: sum("fatGrams"),
    carbohydratesGrams: sum("carbohydratesGrams"),
  });

  if (!totals.success) {
    for (const issue of totals.error.issues) {
      const field = issue.path.join(".") || "form";
      errors[`totals.${field}`] ??= issue.message;
    }

    return { value: null, errors };
  }

  return {
    value: { foods: parsedFoods, totals: totals.data },
    errors: {},
  };
}
