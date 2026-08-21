import type { ReactNode } from "react";

type FeaturePageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function FeaturePageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: FeaturePageShellProps) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        ) : null}
      </div>

      {children ? <div className="space-y-6">{children}</div> : null}
    </section>
  );
}
