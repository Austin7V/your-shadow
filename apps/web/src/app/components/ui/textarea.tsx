import type { TextareaHTMLAttributes } from "react";
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
  ...props
}: TextareaProps) {
  const fieldId = id ?? label.toLowerCase().replaceAll(" ", "-");
  const messageId = `${fieldId}-message`;

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <textarea
        id={fieldId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={`min-h-28 w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-error" : "border-border"
        } ${className ?? ""}`}
        {...props}
      />

      <div id={messageId}>
        <FieldMessage error={error} hint={hint} />
      </div>
    </div>
  );
}
