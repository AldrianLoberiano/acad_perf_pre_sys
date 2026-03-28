"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

const PIE_COLORS = ["#059669", "#dc2626"];

export default function AnalyticsPage() {
  const token = useAuthGuard();

  const overviewQuery = useQuery({
    queryKey: ["analytics-overview", token],
    queryFn: () => analyticsApi.overview(token as string),
    enabled: Boolean(token)
  });

  const passFailData = overviewQuery.data
    ? [
        { name: "Pass", value: overviewQuery.data.pass_fail_ratio.pass },
        { name: "Fail", value: overviewQuery.data.pass_fail_ratio.fail }
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-6 fade-in">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Analytics</h2>
          <p className="mt-1 text-sm text-ink-light">
            Visual insights into student performance data
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 stagger">
          {/* Bar chart */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Top Performers</h3>
                <p className="text-xs text-ink-light">Average scores by student</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewQuery.data?.top_performers ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="avg_score" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie chart */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Pass vs Fail</h3>
                <p className="text-xs text-ink-light">Distribution of predicted outcomes</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                    stroke="none"
                  >
                    {passFailData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs text-ink-light">Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger" />
                <span className="text-xs text-ink-light">Fail</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
