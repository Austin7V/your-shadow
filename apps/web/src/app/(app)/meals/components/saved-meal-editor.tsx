"use client";

import { useRef, useState, type FormEvent } from "react";

import { getMealManagementErrorMessage } from "@/lib/api/meal-management-api";
import {
  MEAL_DESCRIPTION_LIMITS,
  MEAL_QUANTITY_UNITS,
  type MealEntryResponse,
  type MealType,
  type UpdateMealRequest,
} from "@/lib/contracts";
import {
  toEditableFood,
  toEditableNutrition,
  validateAiFoods,
  validateManualDraft,
  type EditableFood,
  type EditableNutrition,
} from "@/lib/meals/meal-draft-validation";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";

type Props = {
  meal: MealEntryResponse;
  onSave: (request: UpdateMealRequest) => Promise<void>;
  onCancel: () => void;
};

type NutritionField = keyof EditableNutrition;
type FoodTextField = "name" | "quantity" | NutritionField;

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const NUTRITION_FIELDS = [
  { key: "caloriesKcal", label: "Calories (kcal)", step: "1" },
  { key: "proteinGrams", label: "Protein (g)", step: "any" },
  { key: "fatGrams", label: "Fat (g)", step: "any" },
  { key: "carbohydratesGrams", label: "Carbohydrates (g)", step: "any" },
] as const;

function NutritionInputs({
  values,
  errors,
  prefix,
  disabled,
  onChange,
}: {
  values: EditableNutrition;
  errors: Record<string, string>;
  prefix: string;
  disabled: boolean;
  onChange: (field: NutritionField, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {NUTRITION_FIELDS.map(({ key, label, step }) => (
        <Input
          key={key}
          label={label}
          type="number"
          min="0"
          step={step}
          inputMode="decimal"
          value={values[key]}
          error={errors[`${prefix}.${key}`]}
          disabled={disabled}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </div>
  );
}

export function SavedMealEditor({ meal, onSave, onCancel }: Props) {
  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [originalText, setOriginalText] = useState(meal.originalText);
  const [foods, setFoods] = useState<EditableFood[]>(() =>
    meal.source === "ai" ? meal.foods.map(toEditableFood) : [],
  );
  const [nutrition, setNutrition] = useState<EditableNutrition>(() =>
    toEditableNutrition(
      meal.source === "manual" ? meal.nutrition : meal.totals,
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);

  const calculatedTotals =
    meal.source === "ai" ? validateAiFoods(foods).value?.totals : null;

  function clearErrors() {
    setErrors({});
    setSaveError("");
  }

  function updateFood(index: number, field: FoodTextField, value: string) {
    setFoods((current) =>
      current.map((food, foodIndex) =>
        foodIndex === index ? { ...food, [field]: value } : food,
      ),
    );
    clearErrors();
  }

  function updateNutrition(field: NutritionField, value: string) {
    setNutrition((current) => ({ ...current, [field]: value }));
    clearErrors();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const description = originalText.trim();

    if (
      description.length < MEAL_DESCRIPTION_LIMITS.minimumLength ||
      originalText.length > MEAL_DESCRIPTION_LIMITS.maximumLength
    ) {
      setErrors({
        originalText: `Enter between ${MEAL_DESCRIPTION_LIMITS.minimumLength} and ${MEAL_DESCRIPTION_LIMITS.maximumLength} characters.`,
      });
      return;
    }

    let request: UpdateMealRequest;

    if (meal.source === "manual") {
      const checked = validateManualDraft(description, nutrition);

      if (!checked.value) {
        setErrors(checked.errors);
        return;
      }

      request = {
        source: "manual",
        mealType,
        originalText: checked.value.originalText,
        nutrition: checked.value.nutrition,
      };
    } else {
      const checked = validateAiFoods(foods);

      if (!checked.value) {
        setErrors(checked.errors);
        return;
      }

      request = {
        source: "ai",
        mealType,
        originalText: description,
        foods: checked.value.foods,
        totals: checked.value.totals,
      };
    }

    inFlight.current = true;
    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(request);
    } catch (error) {
      setSaveError(getMealManagementErrorMessage(error));
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} noValidate className="space-y-5">
      <h3 className="text-lg font-semibold">Edit saved meal</h3>

      <Select
        label="Meal type"
        options={MEAL_TYPES}
        placeholder={null}
        value={mealType}
        disabled={isSaving}
        onChange={(event) => {
          const selected = MEAL_TYPES.find(
            (option) => option.value === event.target.value,
          );
          if (selected) setMealType(selected.value);
          clearErrors();
        }}
      />

      <Textarea
        label="What did you eat?"
        value={originalText}
        maxLength={MEAL_DESCRIPTION_LIMITS.maximumLength}
        error={errors.originalText}
        disabled={isSaving}
        onChange={(event) => {
          setOriginalText(event.target.value);
          clearErrors();
        }}
      />

      {meal.source === "ai" ? (
        <>
          {foods.map((food, index) => (
            <div
              key={index}
              className="space-y-4 rounded-control border border-border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">Food {index + 1}</h4>
                <Button
                  type="button"
                  variant="quiet"
                  disabled={isSaving || foods.length === 1}
                  onClick={() => {
                    setFoods((current) =>
                      current.filter((_, foodIndex) => foodIndex !== index),
                    );
                    clearErrors();
                  }}
                >
                  Remove
                </Button>
              </div>

              <Input
                label="Food name"
                value={food.name}
                error={errors[`foods.${index}.name`]}
                disabled={isSaving}
                onChange={(event) =>
                  updateFood(index, "name", event.target.value)
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={food.quantity}
                  error={errors[`foods.${index}.quantity`]}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateFood(index, "quantity", event.target.value)
                  }
                />
                <Select
                  label="Unit"
                  placeholder={null}
                  value={food.unit}
                  options={MEAL_QUANTITY_UNITS.map((unit) => ({
                    value: unit,
                    label: unit,
                  }))}
                  error={errors[`foods.${index}.unit`]}
                  disabled={isSaving}
                  onChange={(event) => {
                    const unit = MEAL_QUANTITY_UNITS.find(
                      (candidate) => candidate === event.target.value,
                    );
                    if (!unit) return;
                    setFoods((current) =>
                      current.map((item, foodIndex) =>
                        foodIndex === index ? { ...item, unit } : item,
                      ),
                    );
                    clearErrors();
                  }}
                />
              </div>

              <NutritionInputs
                values={food}
                errors={errors}
                prefix={`foods.${index}`}
                disabled={isSaving}
                onChange={(field, value) => updateFood(index, field, value)}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            disabled={isSaving || foods.length >= 20}
            onClick={() => {
              setFoods((current) => [
                ...current,
                {
                  name: "",
                  quantity: "",
                  unit: MEAL_QUANTITY_UNITS[0],
                  caloriesKcal: "",
                  proteinGrams: "",
                  fatGrams: "",
                  carbohydratesGrams: "",
                  confidence: 1,
                  isEstimate: true,
                },
              ]);
              clearErrors();
            }}
          >
            Add food
          </Button>

          <div className="rounded-control bg-surface-muted p-4">
            <h4 className="font-semibold">Calculated totals</h4>
            <p className="mt-2 text-sm">
              {calculatedTotals
                ? `${calculatedTotals.caloriesKcal} kcal · ${calculatedTotals.proteinGrams} g protein · ${calculatedTotals.fatGrams} g fat · ${calculatedTotals.carbohydratesGrams} g carbohydrates`
                : "Complete the food fields to calculate totals."}
            </p>
            {errors.foods ||
            Object.keys(errors).some((key) => key.startsWith("totals.")) ? (
              <p role="alert" className="mt-2 text-sm text-error-content">
                Check the foods and calculated totals.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <NutritionInputs
          values={nutrition}
          errors={errors}
          prefix="nutrition"
          disabled={isSaving}
          onChange={updateNutrition}
        />
      )}

      {saveError ? (
        <p role="alert" className="text-sm text-error-content">
          {saveError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={isSaving} loadingLabel="Saving...">
          Save changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
