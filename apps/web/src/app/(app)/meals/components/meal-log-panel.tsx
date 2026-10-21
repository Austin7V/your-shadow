"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { useProfile } from "@/hooks/use-profile";
import {
  deleteMeal,
  getDailyNutritionTotals,
  getMealManagementErrorMessage,
  listMealsByDate,
  updateMeal,
} from "@/lib/api/meal-management-api";
import type {
  DailyNutritionTotalsResponse,
  ListMealsResponse,
  MealEntryResponse,
  UpdateMealRequest,
} from "@/lib/contracts";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { FeedbackState } from "../../../components/ui/feedback-state";
import { Input } from "../../../components/ui/input";
import { SavedMealEditor } from "./saved-meal-editor";

type Props = {
  refreshKey: number;
};

function dateInTimeZone(timeZone: string, date: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function nutritionFor(meal: MealEntryResponse) {
  return meal.source === "ai" ? meal.totals : meal.nutrition;
}

export function MealLogPanel({ refreshKey }: Props) {
  const {
    profile,
    error: profileError,
    isLoading: isLoadingProfile,
  } = useProfile();

  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = profile ? dateInTimeZone(profile.timezone, now) : null;
  const date = selectedDate ?? today;

  const {
    data: mealList,
    error: mealsError,
    isLoading: isLoadingMeals,
    mutate: refreshMeals,
  } = useSWR<ListMealsResponse, Error>(
    date ? ["meals", date, refreshKey] : null,
    () => listMealsByDate(date!),
  );

  const {
    data: dailyTotals,
    error: totalsError,
    isLoading: isLoadingTotals,
    mutate: refreshTotals,
  } = useSWR<DailyNutritionTotalsResponse, Error>(
    date ? ["meal-totals", date, refreshKey] : null,
    () => getDailyNutritionTotals(date!),
  );

  async function saveMeal(request: UpdateMealRequest) {
    if (!editingId) return;

    await updateMeal(editingId, request);

    setEditingId(null);
    setActionError("");
    setNotice("Meal updated.");
    void Promise.allSettled([refreshMeals(), refreshTotals()]);
  }

  async function removeMeal(id: string) {
    if (deletingId) return;

    setDeletingId(id);
    setActionError("");
    setNotice("");

    try {
      await deleteMeal(id);
      setConfirmDeleteId(null);
      setNotice("Meal deleted.");
      void Promise.allSettled([refreshMeals(), refreshTotals()]);
    } catch (error) {
      setActionError(getMealManagementErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  function changeDate(value: string) {
    setSelectedDate(value || null);
    setEditingId(null);
    setConfirmDeleteId(null);
    setActionError("");
    setNotice("");
  }

  return (
    <Card as="section" aria-label="Saved meals" className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Saved meals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review meals and nutrition totals for a day.
        </p>
      </div>

      {profileError ? (
        <FeedbackState
          icon={AlertCircle}
          tone="error"
          title="Could not load your time zone"
          description="Try refreshing the page."
          role="alert"
        />
      ) : null}

      {isLoadingProfile ? (
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      ) : null}

      {date ? (
        <>
          <div className="max-w-xs">
            <Input
              label="Day"
              type="date"
              value={date}
              max={today ?? undefined}
              onChange={(event) => changeDate(event.target.value)}
            />
          </div>

          {mealsError || totalsError ? (
            <FeedbackState
              icon={AlertCircle}
              tone="error"
              title="Could not load saved meals"
              description={getMealManagementErrorMessage(
                mealsError ?? totalsError,
              )}
              role="alert"
            />
          ) : null}

          {actionError ? (
            <p role="alert" className="text-sm text-error-content">
              {actionError}
            </p>
          ) : null}

          {notice ? (
            <p role="status" className="text-sm text-foreground">
              {notice}
            </p>
          ) : null}

          {isLoadingMeals || isLoadingTotals ? (
            <p className="text-sm text-muted-foreground">Loading meals...</p>
          ) : null}

          {dailyTotals ? (
            <div className="rounded-control bg-surface-muted p-4">
              <h3 className="font-semibold">
                Daily totals · {dailyTotals.mealCount}{" "}
                {dailyTotals.mealCount === 1 ? "meal" : "meals"}
              </h3>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <span>{dailyTotals.caloriesKcal} kcal</span>
                <span>{dailyTotals.proteinGrams} g protein</span>
                <span>{dailyTotals.fatGrams} g fat</span>
                <span>{dailyTotals.carbohydratesGrams} g carbohydrates</span>
              </div>
            </div>
          ) : null}

          {mealList?.meals.length === 0 ? (
            <p className="rounded-control border border-border p-4 text-sm text-muted-foreground">
              No meals saved for this day.
            </p>
          ) : null}

          {mealList?.meals.map((meal) => {
            const nutrition = nutritionFor(meal);
            const isEditing = editingId === meal.id;
            const isConfirmingDelete = confirmDeleteId === meal.id;

            return (
              <div
                key={meal.id}
                className="space-y-4 rounded-control border border-border p-4"
              >
                <div>
                  <h3 className="font-semibold capitalize">{meal.mealType}</h3>
                  <p className="mt-1 break-words text-sm">
                    {meal.originalText}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {nutrition.caloriesKcal} kcal · {nutrition.proteinGrams} g
                    protein · {nutrition.fatGrams} g fat ·{" "}
                    {nutrition.carbohydratesGrams} g carbohydrates
                  </p>
                </div>

                {isEditing ? (
                  <SavedMealEditor
                    meal={meal}
                    onSave={saveMeal}
                    onCancel={() => setEditingId(null)}
                  />
                ) : isConfirmingDelete ? (
                  <div className="space-y-3 rounded-control border border-error/40 p-4">
                    <p className="text-sm">
                      Delete this meal? This cannot be undone.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="danger"
                        loading={deletingId === meal.id}
                        loadingLabel="Deleting..."
                        onClick={() => void removeMeal(meal.id)}
                      >
                        Delete meal
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={deletingId === meal.id}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={deletingId !== null}
                      onClick={() => {
                        setEditingId(meal.id);
                        setConfirmDeleteId(null);
                        setActionError("");
                        setNotice("");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="quiet"
                      disabled={deletingId !== null}
                      onClick={() => {
                        setConfirmDeleteId(meal.id);
                        setEditingId(null);
                        setActionError("");
                        setNotice("");
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : null}
    </Card>
  );
}
