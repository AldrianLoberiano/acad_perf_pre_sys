"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
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
      <div className="space-y-4 fade-in">
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase text-ink/60">Class Average</p>
            <p className="mt-2 text-3xl font-bold">{overviewQuery.data?.class_average ?? "-"}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase text-ink/60">Predicted Pass</p>
            <p className="mt-2 text-3xl font-bold text-success">{overviewQuery.data?.pass_fail_ratio.pass ?? 0}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase text-ink/60">At-Risk Students</p>
            <p className="mt-2 text-3xl font-bold text-warn">{atRiskQuery.data?.length ?? 0}</p>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold">Top Performers</h3>
          <ul className="mt-3 space-y-2">
            {(overviewQuery.data?.top_performers ?? []).map((item) => (
              <li key={item.student_id} className="flex items-center justify-between rounded-lg bg-accentSoft px-3 py-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm font-semibold">{item.avg_score}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
