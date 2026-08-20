import type { InputHTMLAttributes } from "react";
import { FieldMessage } from "./field-message";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
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
  const fieldId = id ?? label.toLowerCase().replaceAll(" ", "-");
  const messageId = `${fieldId}-message`;

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className="mt-0.5 size-4 rounded border-border accent-primary focus:outline-2 focus:outline-offset-2 focus:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />

        <span className="text-sm leading-6">{label}</span>
      </label>

      <div id={messageId} className="ml-7">
        <FieldMessage error={error} hint={hint} />
      </div>
    </div>
  );
}
