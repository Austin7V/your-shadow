import type { InputHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type ScaleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Scale({
  id,
  label,
  error,
  hint,
  min = 1,
  max = 10,
  disabled,
  ...props
}: ScaleProps) {
  const fieldId = id ?? label.toLowerCase().replaceAll(" ", "-");
  const messageId = `${fieldId}-message`;

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        id={fieldId}
        type="range"
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className="w-full accent-primary focus:outline-2 focus:outline-offset-2 focus:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />

      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      <div id={messageId}>
        <FieldMessage error={error} hint={hint} />
      </div>
    </div>
  );
}
