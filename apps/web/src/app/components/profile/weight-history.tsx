"use client";

import { CalendarDays, Plus, Scale } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SuccessState } from "@/app/components/ui/success-state";
import { useWeightEntries } from "@/hooks/use-weight-entries";
import { getAuthErrorMessage } from "@/lib/api/auth-api";
import { createWeightEntry } from "@/lib/api/profile-api";

const formatMeasurementDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)} UTC`;
};

const validateWeight = (value: string): string | null => {
  const pattern = /^\d+(?:\.\d{1,2})?$/;
  const weightKg = Number(value);

  if (!pattern.test(value) || weightKg < 30 || weightKg > 500) {
    return "Weight must be between 30 and 500 kg.";
  }

  return null;
};

export function WeightHistory() {
  const { weightEntries, error, isLoading, refreshWeightEntries } =
    useWeightEntries();

  const [weightKg, setWeightKg] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedState, setShowSavedState] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setSubmitError(null);
    setShowSavedState(false);

    const validationError = validateWeight(weightKg);

    if (validationError !== null) {
      setWeightError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await createWeightEntry({
        weightKg: Number(weightKg),
      });

      await refreshWeightEntries();
      setWeightKg("");
      setWeightError(null);
      setShowSavedState(true);
    } catch (requestError: unknown) {
      setSubmitError(getAuthErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Skeleton label="Loading weight history" lines={5} />;
  }

  if (error !== null) {
    return (
      <ErrorState
        title="Unable to load weight history"
        description={error.message}
        onRetry={() => void refreshWeightEntries()}
      />
    );
  }

  const latestEntry = weightEntries[0];

  return (
    <div className="space-y-4">
      {showSavedState ? (
        <SuccessState
          title="Measurement saved"
          description="Your new weight entry has been added to the history."
        />
      ) : null}

      <section className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="border-b border-border pb-5">
          <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
            Progress context
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Weight history
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            Every measurement is stored as a separate entry, so previous
            values remain available for your review.
          </p>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)]">
          <div className="min-w-0">
            {latestEntry ? (
              <div className="mb-5 flex flex-col gap-4 rounded-card border border-progress/40 bg-progress/10 p-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Latest measurement
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
                    {latestEntry.weightKg}
                    <span className="ml-2 text-lg font-semibold text-muted-foreground">
                      kg
                    </span>
                  </p>
                </div>

                <p className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-4 shrink-0 text-analytics"
                    strokeWidth={2}
                  />
                  {formatMeasurementDate(latestEntry.measuredAt)}
                </p>
              </div>
            ) : null}

            {weightEntries.length === 0 ? (
              <EmptyState
                title="No measurements yet"
                description="Add your first measurement when you are ready. An empty history is a neutral starting point."
              />
            ) : (
              <>
                <ol
                  aria-label="Weight measurements"
                  className="divide-y divide-border overflow-hidden rounded-card border border-border md:hidden"
                >
                  {weightEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start justify-between gap-4 bg-surface px-4 py-4"
                    >
                      <span className="min-w-0 text-sm leading-6 text-muted-foreground">
                        {formatMeasurementDate(entry.measuredAt)}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {entry.weightKg} kg
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="hidden max-h-80 overflow-y-auto rounded-card border border-border md:block">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Weight measurement history in UTC
                    </caption>
                    <thead className="sticky top-0 bg-surface-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right font-semibold"
                        >
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {weightEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatMeasurementDate(entry.measuredAt)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {entry.weightKg} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <form
            className="h-fit space-y-5 rounded-card border border-border bg-surface-muted p-5"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-surface text-primary"
              >
                <Scale className="size-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Add measurement</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The current date and time are added automatically.
                </p>
              </div>
            </div>

            <Input
              label="Weight"
              name="weightKg"
              type="number"
              inputMode="decimal"
              min={30}
              max={500}
              step={0.01}
              value={weightKg}
              error={weightError ?? undefined}
              hint="Kilograms"
              disabled={isSubmitting}
              onChange={(event) => {
                setWeightKg(event.target.value);
                setWeightError(null);
                setSubmitError(null);
                setShowSavedState(false);
              }}
            />

            {submitError !== null ? (
              <ErrorState
                title="Measurement was not saved"
                description={submitError}
              />
            ) : null}

            <Button
              type="submit"
              loading={isSubmitting}
              loadingLabel="Saving measurement..."
              className="min-h-12 w-full"
            >
              <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
              Save measurement
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
