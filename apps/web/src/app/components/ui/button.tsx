import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-ring",
  secondary:
    "border border-border bg-surface hover:bg-surface-muted focus-visible:outline-ring",
  danger:
    "bg-error text-primary-foreground hover:opacity-90 focus-visible:outline-error",
};

export function Button({
  children,
  className,
  disabled,
  loading = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variantClasses[variant]
      } ${className ?? ""}`}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
