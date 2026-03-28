import clsx from "clsx";
import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warn" | "danger" | "accent";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-hover text-ink-light border-border",
  success: "bg-success-soft text-success border-success/20",
  warn: "bg-warn-soft text-warn border-warn/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  accent: "bg-accent-soft text-accent border-accent-muted"
};

export function Badge({
  children,
  variant = "default",
  className
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
