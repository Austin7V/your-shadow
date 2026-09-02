import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <section className="rounded-panel border border-border bg-surface p-5 shadow-md sm:p-8 lg:p-10">
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-primary-content uppercase">
          Your space
        </p>
        <h1 className="mt-3 text-[clamp(2rem,6vw,2.75rem)] leading-tight font-bold tracking-tight text-balance">
          {title}
        </h1>

        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-8">{children}</div>

      <div className="mt-7 border-t border-border pt-6 text-center text-sm leading-6 text-muted-foreground">
        {footer}
      </div>
    </section>
  );
}
