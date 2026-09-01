import { LoaderCircle } from "lucide-react";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({
  label = "Loading, please wait.",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="motion-enter flex min-h-48 flex-col items-center justify-center gap-4 rounded-card border border-border bg-surface p-6 text-center shadow-sm sm:p-8"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LoaderCircle
          aria-hidden="true"
          className="size-6 animate-spin"
          strokeWidth={2}
        />
      </span>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
