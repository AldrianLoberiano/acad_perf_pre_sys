"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { analyticsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function DashboardPage() {
  const token = useAuthGuard();

  const overviewQuery = useQuery({
    queryKey: ["overview", token],
    queryFn: () => analyticsApi.overview(token as string),
    enabled: Boolean(token)
  });

  const atRiskQuery = useQuery({
    queryKey: ["risk", token],
    queryFn: () => analyticsApi.atRisk(token as string),
    enabled: Boolean(token)
  });

  return (
    <AppShell>
      <div className="space-y-6 fade-in">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Dashboard</h2>
          <p className="mt-1 text-sm text-ink-light">
            Overview of student performance and predictions
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          <StatCard
            label="Class Average"
            value={overviewQuery.data?.class_average ?? "—"}
            variant="default"
            subtitle="Overall grade average"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
          />
          <StatCard
            label="Predicted Pass"
            value={overviewQuery.data?.pass_fail_ratio.pass ?? 0}
            variant="success"
            subtitle="Students expected to pass"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <StatCard
            label="At-Risk Students"
            value={atRiskQuery.data?.length ?? 0}
            variant="warn"
            subtitle="Students needing attention"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          />
        </div>

        {/* Top Performers */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">Top Performers</h3>
              <p className="text-xs text-ink-light">Students with highest average scores</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            {(overviewQuery.data?.top_performers ?? []).map((item, index) => (
              <div
                key={item.student_id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors duration-150 hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-ink">{item.name}</span>
                </div>
                <span className="rounded-lg bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  {item.avg_score}
                </span>
              </div>
            ))}
            {(overviewQuery.data?.top_performers ?? []).length === 0 && !overviewQuery.isLoading && (
              <div className="py-8 text-center text-sm text-ink-light">
                No performer data available yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
