import { ReactNode } from "react";
import clsx from "clsx";

type StatVariant = "default" | "success" | "warn" | "danger" | "navy";

const cardStyles: Record<StatVariant, string> = {
  default: "bg-surface border border-border",
  success: "bg-surface border border-border",
  warn: "bg-surface border border-border",
  danger: "bg-surface border border-border",
  navy: "bg-navy border-none text-white shadow-navy"
};

const iconBg: Record<StatVariant, string> = {
  default: "bg-surface-muted text-ink-light",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  navy: "bg-white/10 text-white/80"
};

const labelColor: Record<StatVariant, string> = {
  default: "text-ink-light",
  success: "text-ink-light",
  warn: "text-ink-light",
  danger: "text-ink-light",
  navy: "text-white/70"
};

const valueColor: Record<StatVariant, string> = {
  default: "text-ink",
  success: "text-success",
  warn: "text-warn",
  danger: "text-danger",
  navy: "text-white"
};

const subtitleColor: Record<StatVariant, string> = {
  default: "text-ink-light",
  success: "text-ink-light",
  warn: "text-ink-light",
  danger: "text-ink-light",
  navy: "text-white/60"
};

export function StatCard({
  label,
  value,
  icon,
  variant = "default",
  subtitle,
  valueSuffix,
  children
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: StatVariant;
  subtitle?: string;
  valueSuffix?: string;
  children?: ReactNode;
}) {
  return (
    <div className={clsx(
      "rounded-2xl p-5 shadow-card card-lift",
      cardStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <p className={clsx("text-[11px] font-semibold uppercase tracking-widest", labelColor[variant])}>
          {label}
        </p>
        {icon && (
          <div className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", iconBg[variant])}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={clsx("text-stat tracking-tight", valueColor[variant])}>
          {value}
        </span>
        {valueSuffix && (
          <span className={clsx("text-lg font-semibold", subtitleColor[variant])}>
            {valueSuffix}
          </span>
        )}
      </div>
      {subtitle && (
        <p className={clsx("mt-2 text-xs leading-relaxed", subtitleColor[variant])}>
          {subtitle}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
