import type { HTMLAttributes, ReactNode } from "react";

type CardElement = "article" | "div" | "section";
type CardVariant =
  | "default"
  | "muted"
  | "raised"
  | "interactive"
  | "destructive";
type CardPadding = "none" | "compact" | "default" | "spacious";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: CardElement;
  children: ReactNode;
  padding?: CardPadding;
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-border bg-surface shadow-sm",
  muted: "border-border bg-surface-muted",
  raised: "border-border bg-surface-raised shadow-md",
  interactive:
    "border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-control hover:border-primary/40 hover:shadow-md",
  destructive: "border-error/40 bg-surface shadow-sm",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  compact: "p-4",
  default: "p-5 sm:p-6",
  spacious: "p-6 sm:p-8",
};

export function Card({
  as: Component = "div",
  children,
  className,
  padding = "default",
  variant = "default",
  ...props
}: CardProps) {
  return (
    <Component
      className={`rounded-card border ${variantClasses[variant]} ${paddingClasses[padding]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </Component>
  );
}
