import type { SelectHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
};

export function Select({
  id,
  label,
  options,
  error,
  hint,
  className,
  disabled,
  ...props
}: SelectProps) {
  const fieldId = id ?? label.toLowerCase().replaceAll(" ", "-");
  const messageId = `${fieldId}-message`;

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <select
        id={fieldId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={`w-full rounded-md border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-error" : "border-border"
        } ${className ?? ""}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div id={messageId}>
        <FieldMessage error={error} hint={hint} />
      </div>
    </div>
  );
}
