"use client";

import { useId, type ReactNode } from "react";

type FormSectionVariant = "default" | "muted";

type FormSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  variant?: FormSectionVariant;
  className?: string;
};

const variantClasses: Record<FormSectionVariant, string> = {
  default: "bg-surface shadow-sm",
  muted: "bg-surface-muted",
};

export function FormSection({
  title,
  description,
  actions,
  children,
  variant = "default",
  className,
}: FormSectionProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`motion-enter rounded-card border border-border p-5 sm:p-6 ${variantClasses[variant]} ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id={titleId} className="text-xl font-semibold text-foreground">
            {title}
          </h2>

          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
