import { ReactNode } from "react";
import clsx from "clsx";

type StatVariant = "default" | "success" | "warn" | "danger";

const iconBg: Record<StatVariant, string> = {
  default: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger"
};

export function StatCard({
  label,
  value,
  icon,
  variant = "default",
  subtitle
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant?: StatVariant;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-light">{label}</p>
          <p className={clsx("mt-2 text-3xl font-bold tracking-tight", {
            "text-ink": variant === "default",
            "text-success": variant === "success",
            "text-warn": variant === "warn",
            "text-danger": variant === "danger"
          })}>
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-ink-light">{subtitle}</p>}
        </div>
        <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", iconBg[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
