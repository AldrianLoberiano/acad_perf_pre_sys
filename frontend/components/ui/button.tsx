import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "solid" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  solid: "bg-accent text-white hover:brightness-95",
  outline: "border border-ink/20 bg-white hover:bg-accentSoft",
  ghost: "bg-transparent hover:bg-accentSoft"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
