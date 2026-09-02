import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { FeedbackState } from "./feedback-state";

type SuccessStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SuccessState({
  title,
  description,
  action,
}: SuccessStateProps) {
  return (
    <FeedbackState
      tone="success"
      icon={CircleCheck}
      title={title}
      description={description}
      action={action}
    />
  );
}
