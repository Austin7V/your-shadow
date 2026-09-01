"use client";

import { useState } from "react";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { LoadingState } from "@/app/components/ui/loading-state";
import { ProgressRing } from "@/app/components/ui/progress-ring";
import { SafetyState } from "@/app/components/ui/safety-state";
import { TrendLine } from "@/app/components/ui/trend-line";

export default function FeedbackStatesPage() {
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          UI Foundation
        </p>

        <h1 className="mt-3 text-3xl font-bold">Feedback states</h1>
      </div>

      <LoadingState label="Preparing your daily overview." />

      <EmptyState
        title="No meals logged yet"
        description="Start by adding your first meal for today."
        actionHref="/meals"
        actionLabel="Add a meal"
      />

      <ErrorState
        description="We could not load your daily overview. Please try again."
        onRetry={() => setRetryMessage("Retry action triggered successfully.")}
      />

      {retryMessage ? (
        <p className="text-sm font-medium text-success">{retryMessage}</p>
      ) : null}

      <SafetyState
        title="Medical boundary"
        description="Your Shadow supports healthy everyday habits. It does not provide medical diagnosis, treatment, or emergency advice."
      />

      <section
        aria-labelledby="motion-foundations-title"
        className="motion-enter rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold text-primary">
            Motion foundation
          </p>
          <h2
            id="motion-foundations-title"
            className="mt-1 text-xl font-bold"
          >
            Progress and analytics
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These examples use sample values and render immediately when
            reduced motion is enabled.
          </p>
        </div>

        <div className="mt-6 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <ProgressRing label="Example completion" value={68} />

          <TrendLine
            values={[42, 48, 45, 56, 61, 68]}
            label="Example six-point trend"
            description="The sample trend finishes higher than it starts."
          />
        </div>

        <div
          role="status"
          className="motion-complete mt-6 rounded-md border border-success/40 bg-success/10 p-4 text-sm font-medium text-success"
        >
          Completion reactions are brief and do not change layout.
        </div>
      </section>
    </main>
  );
}
