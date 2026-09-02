import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { FeedbackState } from "./feedback-state";

type SafetyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SafetyState({
  title,
  description,
  action,
}: SafetyStateProps) {
  return (
    <FeedbackState
      tone="safety"
      role="note"
      icon={ShieldAlert}
      title={title}
      description={description}
      action={action}
    />
  );
}
