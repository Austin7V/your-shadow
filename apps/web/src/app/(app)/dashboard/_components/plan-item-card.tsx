"use client";

import type {
  AllowedPlanItemStatusUpdate,
  TodayPlanItemResponse,
} from "@/lib/contracts";
import Link from "next/link";

interface PlanItemCardProps {
  item: TodayPlanItemResponse;
  isUpdating: boolean;
  onStatusChange: (
    itemId: string,
    status: AllowedPlanItemStatusUpdate,
  ) => Promise<void>;
}

const ITEM_PRESENTATION = {
  nutrition: {
    label: "Nutrition",
    href: "/meals",
    actionLabel: "Open meals",
  },
  workout: {
    label: "Workout",
    href: "/workout",
    actionLabel: "Open workout",
  },
  check_in: {
    label: "Check-in",
    href: "/history",
    actionLabel: "View history",
  },
} satisfies Record<
  TodayPlanItemResponse["type"],
  {
    label: string;
    href: string;
    actionLabel: string;
  }
>;

const STATUS_PRESENTATION = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success",
  },
  skipped: {
    label: "Skipped",
    className: "bg-surface-muted text-muted-foreground",
  },
  blocked: {
    label: "Safety limited",
    className: "bg-safety/15 text-safety",
  },
} satisfies Record<
  TodayPlanItemResponse["status"],
  {
    label: string;
    className: string;
  }
>;

export function PlanItemCard({
  item,
  isUpdating,
  onStatusChange,
}: PlanItemCardProps) {
  const itemPresentation = ITEM_PRESENTATION[item.type];
  const statusPresentation = STATUS_PRESENTATION[item.status];
  const canUpdate = item.status === "pending";

  async function updateStatus(
    status: AllowedPlanItemStatusUpdate,
  ): Promise<void> {
    await onStatusChange(item.id, status);
  }

  return (
    <article
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
      aria-busy={isUpdating}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            {itemPresentation.label}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {item.payload.title}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPresentation.className}`}
        >
          {statusPresentation.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {item.payload.description}
      </p>

      {item.payload.explanation !== null ? (
        <p className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
          {item.payload.explanation}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={itemPresentation.href}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {itemPresentation.actionLabel}
        </Link>

        {canUpdate ? (
          <>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => void updateStatus("completed")}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Updating..." : "Complete"}
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => void updateStatus("skipped")}
              className="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              Skip
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
