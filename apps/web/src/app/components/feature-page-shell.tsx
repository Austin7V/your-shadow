import type { ReactNode } from "react";

type FeaturePageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function FeaturePageShell({
  eyebrow,
  title,
  description,
  status,
  actions,
  children,
}: FeaturePageShellProps) {
  return (
    <section className="motion-enter space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              {eyebrow}
            </p>

            {status ? (
              <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {status}
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] leading-[1.08] font-bold tracking-tight text-balance">
            {title}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>

      {children ? (
        <div className="motion-enter motion-delay-1 space-y-6">{children}</div>
      ) : null}
    </section>
  );
}
