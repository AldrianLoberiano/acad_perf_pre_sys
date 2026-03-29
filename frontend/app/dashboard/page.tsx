"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

/* ── Demo engagement data (weekly) ── */
const weeklyEngagement = [
  { day: "MON", activity: 28, assessment: 15 },
  { day: "TUE", activity: 45, assessment: 32 },
  { day: "WED", activity: 38, assessment: 22 },
  { day: "THU", activity: 42, assessment: 28 },
  { day: "FRI", activity: 68, assessment: 55 },
  { day: "SAT", activity: 52, assessment: 35 }
];

const monthlyEngagement = [
  { day: "WK 1", activity: 55, assessment: 40 },
  { day: "WK 2", activity: 62, assessment: 48 },
  { day: "WK 3", activity: 48, assessment: 35 },
  { day: "WK 4", activity: 72, assessment: 60 }
];

/* ── Excellence circle data ── */
const excellenceCircle = [
  { name: "Eleanor Vance", department: "Data Science", score: 98.4, badge: "PEAK", badgeColor: "bg-emerald-500" },
  { name: "Marcus Holloway", department: "Applied Ethics", score: 96.2, badge: "STABLE", badgeColor: "bg-amber-500" },
  { name: "Sarah Chen", department: "Cognitive Psych", score: 95.9, badge: "RISING", badgeColor: "bg-rose-500" }
];

/* ── Avatars for faculty ── */
const facultyColors = ["#1e3a5f", "#2563eb", "#059669"];

export default function DashboardPage() {
  const token = useAuthGuard();
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

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

  const classAvg = overviewQuery.data?.class_average
    ? Number(overviewQuery.data.class_average).toFixed(1)
    : "84.2";

  const totalStudents = overviewQuery.data
    ? overviewQuery.data.pass_fail_ratio.pass + overviewQuery.data.pass_fail_ratio.fail
    : 0;

  const passRate = totalStudents > 0
    ? ((overviewQuery.data!.pass_fail_ratio.pass / totalStudents) * 100).toFixed(1)
    : "92.0";

  const atRiskCount = atRiskQuery.data?.length ?? 4;

  const chartData = chartView === "weekly" ? weeklyEngagement : monthlyEngagement;

  const excellenceItems = overviewQuery.data?.top_performers
    ? overviewQuery.data.top_performers.map((student, index) => ({
        name: student.name,
        department: "Department",
        score: student.avg_score,
        badge: index === 0 ? "PEAK" : index === 1 ? "STABLE" : "RISING",
        badgeColor: index === 0 ? "bg-emerald-500" : index === 1 ? "bg-amber-500" : "bg-rose-500"
      }))
    : excellenceCircle;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ═══ Page Header ═══ */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
              Spring Semester 2024
            </p>
            <h2 className="font-display text-2xl font-extrabold text-ink mt-1">
              Cohort Performance Overview
            </h2>
          </div>
          {/* Faculty Collaborators */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex -space-x-2">
              {facultyColors.map((color, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-muted text-[10px] font-semibold text-ink-light">
                +12
              </div>
            </div>
            <span className="text-xs font-medium text-ink-light">Faculty Collaborators</span>
          </div>
        </div>

        {/* ═══ Stat Cards Row ═══ */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Class Average */}
          <StatCard
            label="Class Average"
            value={classAvg}
            valueSuffix="%"
            variant="default"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            }
          >
            {/* VS Previous Cohort */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-light">
                  vs. previous cohort
                </span>
                <div className="w-20 h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: "60%" }} />
                </div>
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                3.1%
              </span>
            </div>
          </StatCard>

          {/* Card 2: Predicted Pass Rate (Navy) */}
          <StatCard
            label="Predicted Pass Rate"
            value={passRate}
            valueSuffix="%"
            variant="navy"
            subtitle="Advanced ML models predict a 4% increase in successful completions."
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            }
          />

          {/* Card 3: High Risk Priority */}
          <StatCard
            label="High Risk Priority"
            value={String(atRiskCount).padStart(2, "0")}
            valueSuffix=""
            variant="danger"
            icon={
              <span className="badge-urgent inline-flex items-center rounded-md bg-danger px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                Urgent
              </span>
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold uppercase tracking-wider text-ink-light">Students</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              {/* Student initials */}
              <div className="flex -space-x-1.5">
                {["LM", "JK"].map((initials, i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[9px] font-bold text-white"
                    style={{ backgroundColor: i === 0 ? "#f59e0b" : "#6366f1" }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-ink hover:text-accent transition-colors">
                Action Intervention
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </StatCard>
        </div>

        {/* ═══ Bottom Section: Chart + Excellence Circle ═══ */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Engagement Narrative Chart */}
          <Card>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-ink">Engagement Narrative</h3>
                <p className="text-xs text-ink-light mt-0.5">
                  Correlation between platform activity and assessment outcomes
                </p>
              </div>
              {/* Weekly / Monthly Toggle */}
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${chartView === "weekly" ? "active" : ""}`}
                  onClick={() => setChartView("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`toggle-btn ${chartView === "monthly" ? "active" : ""}`}
                  onClick={() => setChartView("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7ee" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1628",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px rgba(10,22,40,0.3)"
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(37, 99, 235, 0.04)" }}
                  />
                  <Bar
                    dataKey="activity"
                    name="Activity"
                    fill="#c4b5fd"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="assessment"
                    name="Assessment"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Excellence Circle */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-light">
                Excellence Circle
              </h3>
              <button className="text-ink-light hover:text-ink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {excellenceItems.map((item, index) => {
                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: facultyColors[index % facultyColors.length] }}
                    >
                      {item.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
                      <p className="text-[11px] text-ink-light">{item.department}</p>
                    </div>
                    {/* Score + Badge */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink">{item.score}</p>
                      <span className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View Full Roster */}
            <button className="mt-5 w-full py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-ink-light border-t border-border hover:text-accent transition-colors">
              View Full Roster
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
