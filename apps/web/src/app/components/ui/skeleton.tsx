type SkeletonProps = {
  label?: string;
  lines?: number;
};

const lineWidths = ["w-full", "w-11/12", "w-4/5", "w-2/3"];

export function Skeleton({
  label = "Loading content",
  lines = 3,
}: SkeletonProps) {
  const safeLineCount = Math.max(1, Math.min(lines, 6));

  return (
    <div
      role="status"
      aria-label={label}
      className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <div aria-hidden="true" className="animate-pulse space-y-5">
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 rounded-full bg-surface-muted" />
          <div className="h-4 w-32 rounded-full bg-surface-muted" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: safeLineCount }, (_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full bg-surface-muted ${
                lineWidths[index % lineWidths.length]
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
