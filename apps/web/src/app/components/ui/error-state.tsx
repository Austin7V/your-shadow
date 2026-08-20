"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "./button";

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error bg-surface p-6 text-center"
    >
      <CircleAlert aria-hidden="true" className="mx-auto size-8 text-error" />

      <h2 className="mt-4 text-lg font-semibold">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {onRetry ? (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
