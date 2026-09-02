import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./card";

type DestructiveConfirmationProps = {
  title: string;
  description: string;
  children?: ReactNode;
  actions: ReactNode;
};

export function DestructiveConfirmation({
  title,
  description,
  children,
  actions,
}: DestructiveConfirmationProps) {
  return (
    <Card as="section" variant="destructive" className="motion-enter">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-error/10 text-error-content"
        >
          <Trash2 className="size-6" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-error-content">{title}</h2>
          <p className="mt-1.5 text-base leading-7 text-muted-foreground">
            {description}
          </p>

          {children ? <div className="mt-5">{children}</div> : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        </div>
      </div>
    </Card>
  );
}
