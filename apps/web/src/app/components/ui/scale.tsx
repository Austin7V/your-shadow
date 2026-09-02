"use client";

import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import { FieldMessage } from "./field-message";

type ScaleProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "readOnly"
> & {
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
  value,
  defaultValue,
  disabled,
  onChange,
  className,
  ...props
}: ScaleProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasMessage = Boolean(error || hint);
  const minimum = Number(min);
  const maximum = Number(max);
  const initialValue = Number(defaultValue ?? minimum);
  const [internalValue, setInternalValue] = useState(initialValue);
  const parsedValue = value === undefined ? internalValue : Number(value);
  const finiteMinimum = Number.isFinite(minimum) ? minimum : 1;
  const finiteMaximum =
    Number.isFinite(maximum) && maximum >= finiteMinimum
      ? maximum
      : finiteMinimum;
  const finiteValue = Number.isFinite(parsedValue)
    ? parsedValue
    : finiteMinimum;
  const currentValue = Math.min(
    finiteMaximum,
    Math.max(finiteMinimum, finiteValue),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (value === undefined) {
      setInternalValue(Number(event.target.value));
    }

    onChange?.(event);
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-4">
        <label
          htmlFor={fieldId}
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </label>
        <output
          htmlFor={fieldId}
          className="tabular-nums rounded-compact bg-surface-muted px-2.5 py-1 text-sm font-semibold text-primary-content"
        >
          {currentValue}
        </output>
      </div>

      <input
        id={fieldId}
        type="range"
        min={finiteMinimum}
        max={finiteMaximum}
        value={currentValue}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        aria-valuetext={`${currentValue} out of ${finiteMaximum}`}
        onChange={handleChange}
        className={`min-h-11 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
        {...props}
      />

      <div
        aria-hidden="true"
        className="tabular-nums -mt-1 flex justify-between text-xs text-muted-foreground"
      >
        <span>{finiteMinimum}</span>
        <span>{finiteMaximum}</span>
      </div>

      <FieldMessage
        id={hasMessage ? messageId : undefined}
        error={error}
        hint={hint}
      />
    </div>
  );
}
