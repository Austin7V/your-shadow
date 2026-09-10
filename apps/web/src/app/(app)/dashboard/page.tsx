"use client";

import { useState } from "react";

import { getTodayPlanErrorMessage } from "@/lib/api/today-plan-api";
import type { AllowedPlanItemStatusUpdate } from "@/lib/contracts";
import { useTodayPlan } from "@/hooks/use-today-plan";

import { Button } from "../../components/ui/button";
import { PlanItemCard } from "./_components/plan-item-card";

function formatLocalDate(localDate: string): string {
  const date = new Date(`${localDate}T12:00:00.000Z`);

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function DashboardPage() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    generate,
    updateItemStatus,
    mutate,
  } = useTodayPlan();

  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    setActionError(null);
    setIsGenerating(true);

    try {
      await generate();
    } catch (generationError) {
      setActionError(getTodayPlanErrorMessage(generationError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleStatusChange(
    itemId: string,
    status: AllowedPlanItemStatusUpdate,
  ): Promise<void> {
    setActionError(null);
    setUpdatingItemId(itemId);

    try {
      await updateItemStatus(itemId, status);
    } catch (updateError) {
      setActionError(getTodayPlanErrorMessage(updateError));
    } finally {
      setUpdatingItemId(null);
    }
  }

  if (isLoading || data === undefined) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-6" aria-busy="true">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
          <div className="h-10 w-72 max-w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <span className="sr-only">Loading today&apos;s plan</span>
      </main>
    );
  }

  if (error !== undefined) {
    return (
      <main className="mx-auto w-full max-w-6xl">
        <section
          className="rounded-2xl border border-error bg-error/10 p-6"
          role="alert"
        >
          <p className="text-sm font-semibold text-error">
            Today&apos;s plan could not be loaded
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {getTodayPlanErrorMessage(error)}
          </p>

          <div className="mt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void mutate()}
            >
              Try again
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (data.state === "not_generated") {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {formatLocalDate(data.localDate)}
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome back
          </h1>

          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Your plan for today has not been created yet. Generate a short,
            focused plan based on your current goal and safety information.
          </p>
        </header>

        {actionError !== null ? (
          <div
            className="rounded-xl border border-error bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {actionError}
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-primary">
            Ready when you are
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Create today&apos;s plan
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your Shadow will use only the permitted profile, weight, and health
            information required for today&apos;s recommendations.
          </p>

          <div className="mt-6">
            <Button
              type="button"
              loading={isGenerating}
              onClick={() => void handleGenerate()}
            >
              Generate today&apos;s plan
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const orderedItems = [...data.plan.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );

  const completedItems = orderedItems.filter(
    (item) => item.status === "completed",
  ).length;

  const progress =
    orderedItems.length === 0
      ? 0
      : Math.round((completedItems / orderedItems.length) * 100);

  const hasBlockedItems = orderedItems.some(
    (item) => item.status === "blocked",
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {formatLocalDate(data.localDate)}
          </p>

          {isValidating ? (
            <span className="text-sm text-muted-foreground">Updating…</span>
          ) : null}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back
        </h1>

        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Here are the actions that matter today. Keep the day simple and focus
          on one step at a time.
        </p>
      </header>

      {actionError !== null ? (
        <div
          className="rounded-xl border border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {hasBlockedItems ? (
        <aside
          className="rounded-2xl border border-safety bg-safety/10 p-5"
          aria-label="Safety information"
        >
          <p className="font-semibold text-safety">Your safety comes first</p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            One or more activities were limited by your current health
            information. Follow the safety guidance shown in the plan.
          </p>
        </aside>
      ) : null}

      {data.generation.mode === "fallback" ? (
        <aside className="rounded-2xl border border-border bg-surface p-5">
          <p className="font-semibold text-foreground">Safe fallback plan</p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {data.generation.userMessage}
          </p>
        </aside>
      ) : null}

      <section
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
        aria-labelledby="today-progress-heading"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              id="today-progress-heading"
              className="text-sm font-semibold text-foreground"
            >
              Today&apos;s progress
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {completedItems} of {orderedItems.length} actions completed
            </p>
          </div>

          <span className="text-2xl font-semibold text-primary">
            {progress}%
          </span>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Today plan completion"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      {orderedItems.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No actions for today
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            There are currently no plan items to display.
          </p>
        </section>
      ) : (
        <section
          className="grid gap-4 lg:grid-cols-2"
          aria-label="Today plan actions"
        >
          {orderedItems.map((item) => (
            <PlanItemCard
              key={item.id}
              item={item}
              isUpdating={updatingItemId === item.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </section>
      )}
    </main>
  );
}
