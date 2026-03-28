import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "solid" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  solid:
    "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm",
  outline:
    "border border-border bg-surface text-ink hover:bg-surface-hover active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink hover:bg-surface-hover active:scale-[0.98]",
  danger:
    "bg-danger text-white hover:bg-red-700 active:scale-[0.98] shadow-sm"
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
