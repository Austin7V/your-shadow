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
      className="motion-enter flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-8 text-center"
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-7 animate-spin text-primary"
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
