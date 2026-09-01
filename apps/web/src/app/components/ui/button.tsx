import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground shadow-sm hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-ring",
  secondary:
    "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted focus-visible:outline-ring",
  quiet:
    "border border-transparent bg-transparent text-foreground hover:bg-surface-muted focus-visible:outline-ring",
  danger:
    "border border-error bg-error text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-error",
};

export function Button({
  children,
  className,
  disabled,
  loading = false,
  loadingLabel = "Loading...",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`motion-press relative inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variantClasses[variant]
      } ${className ?? ""}`}
      {...props}
    >
      <span
        aria-hidden={loading || undefined}
        className={`inline-flex items-center justify-center gap-2 ${
          loading ? "opacity-0" : ""
        }`}
      >
        {children}
      </span>

      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center gap-2 px-3">
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
            strokeWidth={2}
          />
          <span>{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  );
}
