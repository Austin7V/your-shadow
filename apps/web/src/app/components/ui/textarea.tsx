"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({
  id,
  label,
  error,
  hint,
  className,
  disabled,
  readOnly,
  ...props
}: TextareaProps) {
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

      <textarea
        id={fieldId}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={`min-h-32 w-full resize-y rounded-control border bg-surface px-3.5 py-3 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-control placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 read-only:bg-surface-muted read-only:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${
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
