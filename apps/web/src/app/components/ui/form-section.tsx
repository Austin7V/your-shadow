import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}
