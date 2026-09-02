type TrendLineProps = {
  values: number[];
  label: string;
  description: string;
};

const WIDTH = 240;
const HEIGHT = 96;
const PADDING = 8;

const getSafeValues = (values: number[]): number[] => {
  const finiteValues = values.map((value) =>
    Number.isFinite(value) ? value : 0,
  );

  if (finiteValues.length === 0) {
    return [0, 0];
  }

  if (finiteValues.length === 1) {
    return [finiteValues[0] ?? 0, finiteValues[0] ?? 0];
  }

  return finiteValues;
};

const createPath = (values: number[]): string => {
  const safeValues = getSafeValues(values);
  const minimum = Math.min(...safeValues);
  const maximum = Math.max(...safeValues);
  const range = maximum - minimum;
  const drawableWidth = WIDTH - PADDING * 2;
  const drawableHeight = HEIGHT - PADDING * 2;

  return safeValues
    .map((value, index) => {
      const x =
        PADDING + (index / (safeValues.length - 1)) * drawableWidth;
      const normalizedValue = range === 0 ? 0.5 : (value - minimum) / range;
      const y = PADDING + (1 - normalizedValue) * drawableHeight;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export function TrendLine({
  values,
  label,
  description,
}: TrendLineProps) {
  const path = createPath(values);

  return (
    <figure className="w-full">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-24 w-full overflow-visible"
      >
        <line
          x1={PADDING}
          x2={WIDTH - PADDING}
          y1={HEIGHT - PADDING}
          y2={HEIGHT - PADDING}
          className="stroke-border"
          strokeWidth="1"
        />
        <path
          d={path}
          pathLength="1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="motion-chart-draw stroke-analytics"
          strokeWidth="4"
        />
      </svg>

      <figcaption className="mt-3">
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {description}
        </span>
      </figcaption>
    </figure>
  );
}
