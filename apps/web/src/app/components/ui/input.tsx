"use client";

import { useId, type InputHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({
  id,
  label,
  error,
  hint,
  className,
  disabled,
  readOnly,
  ...props
}: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className="w-full">
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>

      <input
        id={fieldId}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? messageId : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={`min-h-11 w-full rounded-control border bg-surface px-3.5 py-2.5 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-control placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 read-only:bg-surface-muted read-only:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${
          error ? "border-error" : "border-border"
        } ${className ?? ""}`}
        {...props}
      />

      <FieldMessage
        id={hasMessage ? messageId : undefined}
        error={error}
        hint={hint}
      />
    </div>
  );
}
