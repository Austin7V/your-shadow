"use client";

import { useId, type InputHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "readOnly"
> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Checkbox({
  id,
  label,
  error,
  hint,
  disabled,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className="w-full">
      <label
        className={`flex min-h-11 items-start gap-3 rounded-control py-2 text-foreground ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`mt-0.5 size-5 shrink-0 rounded-compact border bg-surface accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed ${
            error ? "border-error" : "border-border"
          }`}
          {...props}
        />

        <span className="text-base leading-6">{label}</span>
      </label>

      <div className="ml-8">
        <FieldMessage
          id={hasMessage ? messageId : undefined}
          error={error}
          hint={hint}
        />
      </div>
    </div>
  );
}
