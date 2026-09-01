"use client";

import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string | null;
};

export function Select({
  id,
  label,
  options,
  error,
  hint,
  placeholder = "Select an option",
  className,
  disabled,
  ...props
}: SelectProps) {
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

      <div className="relative">
        <select
          id={fieldId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`min-h-11 w-full appearance-none rounded-control border bg-surface py-2.5 pr-11 pl-3.5 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-control focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${
            error ? "border-error" : "border-border"
          } ${className ?? ""}`}
          {...props}
        >
          {placeholder !== null ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted-foreground"
          strokeWidth={2}
        />
      </div>

      <FieldMessage
        id={hasMessage ? messageId : undefined}
        error={error}
        hint={hint}
      />
    </div>
  );
}
