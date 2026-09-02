"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  error?: string;
  hint?: string;
};

export function PasswordInput({
  id,
  label,
  error,
  hint,
  className,
  disabled,
  readOnly,
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasMessage = Boolean(error || hint);
  const [isVisible, setIsVisible] = useState(false);
  const VisibilityIcon = isVisible ? EyeOff : Eye;
  const visibilityLabel = isVisible ? "Hide password" : "Show password";

  return (
    <div className="w-full">
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={fieldId}
          type={isVisible ? "text" : "password"}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`min-h-12 w-full rounded-control border bg-surface py-2.5 pr-12 pl-3.5 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-control placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 read-only:bg-surface-muted read-only:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${
            error ? "border-error" : "border-border"
          } ${className ?? ""}`}
          {...props}
        />

        <button
          type="button"
          aria-label={visibilityLabel}
          aria-controls={fieldId}
          title={visibilityLabel}
          disabled={disabled}
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          className="motion-press absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-control text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <VisibilityIcon
            aria-hidden="true"
            className="size-5"
            strokeWidth={2}
          />
        </button>
      </div>

      <FieldMessage
        id={hasMessage ? messageId : undefined}
        error={error}
        hint={hint}
      />
    </div>
  );
}
