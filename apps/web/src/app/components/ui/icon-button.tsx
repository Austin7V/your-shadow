import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "secondary" | "quiet" | "danger";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  label: string;
  children: ReactNode;
  loading?: boolean;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  secondary:
    "border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted focus-visible:outline-ring",
  quiet:
    "border-transparent bg-transparent text-foreground hover:bg-surface-muted focus-visible:outline-ring",
  danger:
    "border-error/50 bg-error/10 text-error hover:bg-error/15 focus-visible:outline-error",
};

export function IconButton({
  label,
  children,
  className,
  disabled,
  loading = false,
  title,
  type = "button",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-busy={loading || undefined}
      title={title ?? label}
      disabled={disabled || loading}
      className={`motion-press inline-flex size-11 shrink-0 items-center justify-center rounded-control border focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variantClasses[variant]
      } ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin"
          strokeWidth={2}
        />
      ) : (
        children
      )}
    </button>
  );
}
