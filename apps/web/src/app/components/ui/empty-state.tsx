import { Inbox } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="motion-enter rounded-card border border-dashed border-border bg-surface p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-primary">
        <Inbox aria-hidden="true" className="size-6" strokeWidth={2} />
      </span>

      <h2 className="mt-4 text-lg font-semibold">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="motion-press mt-5 inline-flex min-h-11 items-center justify-center rounded-control border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
