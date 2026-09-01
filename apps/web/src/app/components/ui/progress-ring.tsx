import type { CSSProperties } from "react";

type ProgressRingSize = "small" | "medium" | "large";

type ProgressRingProps = {
  label: string;
  value: number;
  size?: ProgressRingSize;
};

const sizeClasses: Record<ProgressRingSize, string> = {
  small: "size-24",
  medium: "size-32",
  large: "size-40",
};

const clampPercentage = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

export function ProgressRing({
  label,
  value,
  size = "medium",
}: ProgressRingProps) {
  const normalizedValue = clampPercentage(value);
  const radius = 50;
  const pathLength = 2 * Math.PI * radius;
  const pathOffset = pathLength * (1 - normalizedValue / 100);
  const motionStyle = {
    "--motion-path-length": pathLength,
    "--motion-path-offset": pathOffset,
  } as CSSProperties;

  return (
    <figure className="inline-flex flex-col items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
        className={`relative ${sizeClasses[size]}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="size-full -rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className="stroke-border"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeLinecap="round"
            className="motion-progress-draw stroke-progress"
            strokeWidth="10"
            style={motionStyle}
          />
        </svg>

        <span
          aria-hidden="true"
          className="tabular-nums absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground"
        >
          {normalizedValue}%
        </span>
      </div>

      <figcaption className="text-center text-sm font-medium text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}
