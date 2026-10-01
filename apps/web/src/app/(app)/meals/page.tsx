"use client";

import { AlertCircle, CircleHelp, Sparkles } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { getMealParsingErrorMessage, parseMeal } from "@/lib/api/meal-api";
import {
  MEAL_DESCRIPTION_LIMITS,
  type ParseMealResponse,
} from "@/lib/contracts";

import {
  MealDraftEditor,
  type ReviewedMealDraft,
} from "./components/meal-draft-editor";
import { FeaturePageShell } from "../../components/feature-page-shell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { FeedbackState } from "../../components/ui/feedback-state";
import { Select } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const EXAMPLES = [
  "Oatmeal with milk and a banana",
  "Chicken salad sandwich and an apple",
  "A bowl of rice with tofu and vegetables",
];

type ReviewState =
  | { status: "confirmed"; draft: ReviewedMealDraft }
  | { status: "cancelled" }
  | null;

export default function MealsPage() {
  const [mealType, setMealType] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [typeError, setTypeError] = useState("");
  const [textError, setTextError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [result, setResult] = useState<ParseMealResponse | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>(null);
  const [isParsing, setIsParsing] = useState(false);
  const inFlight = useRef(false);

  function updateText(value: string) {
    setOriginalText(value);
    setTextError("");
    setRequestError("");
    setResult(null);
    setReviewState(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current) return;

    const description = originalText.trim();
    const nextTypeError = mealType ? "" : "Choose a meal type.";
    const nextTextError =
      description.length < MEAL_DESCRIPTION_LIMITS.minimumLength
        ? `Describe your meal in at least ${MEAL_DESCRIPTION_LIMITS.minimumLength} characters.`
        : originalText.length > MEAL_DESCRIPTION_LIMITS.maximumLength
          ? `Use no more than ${MEAL_DESCRIPTION_LIMITS.maximumLength} characters.`
          : "";

    setTypeError(nextTypeError);
    setTextError(nextTextError);

    if (nextTypeError || nextTextError) return;

    inFlight.current = true;
    setIsParsing(true);
    setRequestError("");
    setResult(null);
    setReviewState(null);

    try {
      const response = await parseMeal({ originalText: description });
      setResult(response);
    } catch (error) {
      setRequestError(getMealParsingErrorMessage(error));
    } finally {
      inFlight.current = false;
      setIsParsing(false);
    }
  }

  return (
    <FeaturePageShell
      eyebrow="Meals"
      title="Add a meal"
      description="Describe what you ate. Review the estimate before anything is added to your day."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:items-start">
        <Card as="section" className="min-w-0">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Select
              label="Meal type"
              options={MEAL_TYPES}
              value={mealType}
              error={typeError}
              disabled={isParsing}
              onChange={(event) => {
                setMealType(event.target.value);
                setTypeError("");
                setRequestError("");
                setResult(null);
                setReviewState(null);
              }}
            />

            <div>
              <Textarea
                label="What did you eat?"
                placeholder="For example, two eggs on toast and a cup of coffee"
                value={originalText}
                maxLength={MEAL_DESCRIPTION_LIMITS.maximumLength}
                error={textError}
                disabled={isParsing}
                onChange={(event) => updateText(event.target.value)}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {originalText.length}/{MEAL_DESCRIPTION_LIMITS.maximumLength}
              </p>
            </div>

            <Button
              type="submit"
              loading={isParsing}
              loadingLabel="Parsing meal..."
              className="w-full sm:w-auto"
            >
              <Sparkles aria-hidden="true" className="size-4" />
              Parse meal
            </Button>
          </form>
        </Card>

        <Card as="section" variant="muted" className="min-w-0">
          <h2 className="text-base font-semibold">Need an example?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Include amounts when you know them. Choose an example to start.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                disabled={isParsing}
                onClick={() => updateText(example)}
                className="min-h-11 rounded-control border border-border bg-surface px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {requestError ? (
        <FeedbackState
          icon={AlertCircle}
          tone="error"
          title="Could not parse meal"
          description={requestError}
          role="alert"
        />
      ) : null}

      {result ? (
        <div className="space-y-4">
          {"status" in result ? (
            <FeedbackState
              icon={CircleHelp}
              tone="warning"
              title="Unable to estimate this meal"
              description="The parsing service is unavailable. You can enter the nutrition values manually. Nothing has been saved."
            />
          ) : null}

          <MealDraftEditor
            result={result}
            mealType={mealType}
            originalText={originalText.trim()}
            onCancel={() => {
              setResult(null);
              setReviewState({ status: "cancelled" });
            }}
            onConfirm={(draft) => {
              setResult(null);
              setReviewState({ status: "confirmed", draft });
            }}
          />
        </div>
      ) : null}

      {reviewState?.status === "confirmed" ? (
        <FeedbackState
          icon={Sparkles}
          tone="success"
          title="Values confirmed"
          description={`Reviewed total: ${reviewState.draft.totals.caloriesKcal} kcal. This meal has not been saved yet.`}
        />
      ) : null}

      {reviewState?.status === "cancelled" ? (
        <FeedbackState
          icon={CircleHelp}
          tone="warning"
          title="Review cancelled"
          description="The draft was discarded. Nothing has been saved."
        />
      ) : null}
    </FeaturePageShell>
  );
}
