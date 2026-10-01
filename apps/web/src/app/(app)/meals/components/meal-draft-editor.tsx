"use client";

import { CircleHelp } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  MEAL_QUANTITY_UNITS,
  type MealDraftFoodOutput,
  type MealNutritionTotals,
  type ParseMealResponse,
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
import { Card } from "../../../components/ui/card";
import { FeedbackState } from "../../../components/ui/feedback-state";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";

export type ReviewedMealDraft =
  | {
      source: "ai";
      mealType: string;
      originalText: string;
      foods: MealDraftFoodOutput[];
      totals: MealNutritionTotals;
      confidence: number;
    }
  | {
      source: "manual";
      mealType: string;
      originalText: string;
      totals: MealNutritionTotals;
    };

type MealDraftEditorProps = {
  result: ParseMealResponse;
  mealType: string;
  originalText: string;
  onCancel: () => void;
  onConfirm: (draft: ReviewedMealDraft) => void;
};

const NUTRITION_FIELDS = [
  { key: "caloriesKcal", label: "Calories (kcal)", step: "1" },
  { key: "proteinGrams", label: "Protein (g)", step: "any" },
  { key: "fatGrams", label: "Fat (g)", step: "any" },
  { key: "carbohydratesGrams", label: "Carbohydrates (g)", step: "any" },
] as const;

type NutritionField = keyof EditableNutrition;
type FoodField = "name" | "quantity" | "unit" | NutritionField;

function NutritionInputs({
  values,
  errors,
  prefix,
  onChange,
}: {
  values: EditableNutrition;
  errors: Record<string, string>;
  prefix: string;
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
          onChange={(event) => onChange(key, event.target.value)}
        />
      ))}
    </div>
  );
}

export function MealDraftEditor({
  result,
  mealType,
  originalText,
  onCancel,
  onConfirm,
}: MealDraftEditorProps) {
  const [foods, setFoods] = useState<EditableFood[]>(() =>
    "foods" in result ? result.foods.map(toEditableFood) : [],
  );
  const [nutrition, setNutrition] = useState<EditableNutrition>(() =>
    "status" in result
      ? toEditableNutrition(result.nutrition)
      : toEditableNutrition(result.totals),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const aiTotals =
    "foods" in result ? validateAiFoods(foods).value?.totals : null;

  function updateFood(index: number, field: FoodField, value: string) {
    setFoods((current) =>
      current.map((food, foodIndex) =>
        foodIndex === index ? { ...food, [field]: value } : food,
      ),
    );
    setErrors({});
  }

  function updateNutrition(field: NutritionField, value: string) {
    setNutrition((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if ("status" in result) {
      const checked = validateManualDraft(originalText, nutrition);

      if (!checked.value) {
        setErrors(checked.errors);
        return;
      }

      onConfirm({
        source: "manual",
        mealType,
        originalText: checked.value.originalText,
        totals: checked.value.nutrition,
      });
      return;
    }

    const checked = validateAiFoods(foods);

    if (!checked.value) {
      setErrors(checked.errors);
      return;
    }

    if (result.clarification.needed) {
      setErrors({
        form: "Add the missing detail to your description and parse again.",
      });
      return;
    }

    onConfirm({
      source: "ai",
      mealType,
      originalText,
      foods: checked.value.foods,
      totals: checked.value.totals,
      confidence: result.confidence,
    });
  }

  return (
    <Card as="section" aria-label="Review meal draft">
      <form
        id="meal-draft-confirmation"
        onSubmit={handleConfirm}
        noValidate
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold">Review your meal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check the estimates and correct any values before confirming.
            Nothing has been saved yet.
          </p>
        </div>

        <div className="rounded-control bg-surface-muted p-4">
          <p className="text-sm font-semibold">Your description · {mealType}</p>
          <p className="mt-2 break-words text-sm">{originalText}</p>
        </div>

        {"foods" in result ? (
          <>
            <p className="text-sm text-muted-foreground">
              AI confidence: {Math.round(result.confidence * 100)}%. Nutrition
              values are estimates.
            </p>

            {result.clarification.needed ? (
              <FeedbackState
                icon={CircleHelp}
                tone="warning"
                title="One more detail is needed"
                description={
                  result.clarification.question ??
                  "Add the missing amount to your description and parse again."
                }
              />
            ) : null}

            {foods.map((food, index) => (
              <div
                key={index}
                className="space-y-4 rounded-control border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">Food {index + 1}</h3>
                  <span className="text-xs text-muted-foreground">
                    Estimate · {Math.round(food.confidence * 100)}% confidence
                  </span>
                </div>

                <Input
                  label="Food name"
                  value={food.name}
                  error={errors[`foods.${index}.name`]}
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
                    onChange={(event) =>
                      updateFood(index, "unit", event.target.value)
                    }
                  />
                </div>

                <NutritionInputs
                  values={food}
                  errors={errors}
                  prefix={`foods.${index}`}
                  onChange={(field, value) => updateFood(index, field, value)}
                />
              </div>
            ))}

            <div className="rounded-control bg-surface-muted p-4">
              <h3 className="font-semibold">Calculated totals</h3>
              {aiTotals ? (
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <span>{aiTotals.caloriesKcal} kcal</span>
                  <span>{aiTotals.proteinGrams} g protein</span>
                  <span>{aiTotals.fatGrams} g fat</span>
                  <span>{aiTotals.carbohydratesGrams} g carbohydrates</span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the food fields to calculate totals.
                </p>
              )}
              {errors.foods ||
              Object.keys(errors).some((key) => key.startsWith("totals.")) ? (
                <p role="alert" className="mt-2 text-sm text-error-content">
                  Check the foods and calculated totals.
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold">Enter nutrition manually</h3>
            <NutritionInputs
              values={nutrition}
              errors={errors}
              prefix="nutrition"
              onChange={updateNutrition}
            />
          </div>
        )}

        {errors.form ? (
          <p role="alert" className="text-sm text-error-content">
            {errors.form}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={"foods" in result && result.clarification.needed}
          >
            Confirm values
          </Button>
        </div>
      </form>
    </Card>
  );
}
