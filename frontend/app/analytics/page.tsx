"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
      <div className="space-y-4 fade-in">
        <h2 className="font-display text-2xl font-bold">Analytics</h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-lg font-semibold">Top Performers</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewQuery.data?.top_performers ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg_score" fill="#0f8b8d" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 text-lg font-semibold">Pass vs Fail</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={passFailData} dataKey="value" nameKey="name" fill="#f0a202" label />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
