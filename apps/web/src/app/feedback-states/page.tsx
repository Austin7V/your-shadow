"use client";

import { useState } from "react";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ErrorState } from "@/app/components/ui/error-state";
import { LoadingState } from "@/app/components/ui/loading-state";
import { SafetyState } from "@/app/components/ui/safety-state";

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
    </main>
  );
}
