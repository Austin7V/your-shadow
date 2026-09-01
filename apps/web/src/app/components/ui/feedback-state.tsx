import type { AriaRole, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type FeedbackTone = "error" | "safety" | "success" | "warning";

type FeedbackStateProps = {
  icon: LucideIcon;
  tone: FeedbackTone;
  title: string;
  description: string;
  action?: ReactNode;
  role?: AriaRole;
};

const toneClasses: Record<
  FeedbackTone,
  { container: string; icon: string }
> = {
  error: {
    container: "border-error/40 bg-error/10",
    icon: "bg-error/15 text-error",
  },
  safety: {
    container: "border-safety/40 bg-safety/10",
    icon: "bg-safety/15 text-safety",
  },
  success: {
    container: "border-success/40 bg-success/10",
    icon: "bg-success/15 text-success",
  },
  warning: {
    container: "border-warning/40 bg-warning/10",
    icon: "bg-warning/15 text-warning",
  },
};

export function FeedbackState({
  icon: Icon,
  tone,
  title,
  description,
  action,
  role = "status",
}: FeedbackStateProps) {
  const classes = toneClasses[tone];

  return (
    <div
      role={role}
      className={`motion-enter rounded-card border p-5 sm:p-6 ${classes.container}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-control ${classes.icon}`}
        >
          <Icon className="size-6" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          {action ? (
            <div className="mt-5 flex flex-wrap gap-3">{action}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
