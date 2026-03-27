"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/predictions", label: "Predictions" },
  { href: "/analytics", label: "Analytics" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">Academic Signal Studio</h1>
            <p className="text-xs text-ink/60">Predict • Detect • Improve</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-ink">
              {user?.username} ({user?.role})
            </span>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl bg-white p-3 shadow-glow">
          <nav className="space-y-2">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-accent text-white" : "text-ink hover:bg-accentSoft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
