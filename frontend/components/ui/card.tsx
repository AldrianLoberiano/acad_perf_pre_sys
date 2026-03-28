import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface border border-border p-5 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
