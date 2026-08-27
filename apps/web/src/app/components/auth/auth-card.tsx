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
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-8">{children}</div>

      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        {footer}
      </div>
    </section>
  );
}
