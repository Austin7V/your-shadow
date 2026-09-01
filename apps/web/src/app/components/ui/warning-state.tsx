import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { FeedbackState } from "./feedback-state";

type WarningStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function WarningState({
  title,
  description,
  action,
}: WarningStateProps) {
  return (
    <FeedbackState
      tone="warning"
      icon={TriangleAlert}
      title={title}
      description={description}
      action={action}
    />
  );
}
