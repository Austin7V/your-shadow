import { ShieldAlert } from "lucide-react";

type SafetyStateProps = {
  title: string;
  description: string;
};

export function SafetyState({ title, description }: SafetyStateProps) {
  return (
    <aside className="rounded-lg border border-safety bg-surface p-6">
      <div className="flex gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-6 text-safety" />

        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </aside>
  );
}
