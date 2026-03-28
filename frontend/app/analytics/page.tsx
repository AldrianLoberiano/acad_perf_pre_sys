"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { analyticsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

const engagementSeries = [
  { week: "Week 1", performance: 72, engagement: 40 },
  { week: "Week 2", performance: 58, engagement: 35 },
  { week: "Week 3", performance: 61, engagement: 39 },
  { week: "Week 4", performance: 62, engagement: 41 },
  { week: "Week 5", performance: 68, engagement: 43 },
  { week: "Week 6", performance: 62, engagement: 39 }
];

const fallbackRows = [
  {
    initials: "EH",
    name: "Elena Henderson",
    engagementScore: 94,
    predictedGrade: "A",
    actualGrade: "A",
    varianceLabel: "STABLE",
    varianceStyle: "bg-emerald-100 text-emerald-700"
  },
  {
    initials: "MK",
    name: "Marcus King",
    engagementScore: 42,
    predictedGrade: "C-",
    actualGrade: "D+",
    varianceLabel: "ALERT",
    varianceStyle: "bg-red-100 text-red-700"
  },
  {
    initials: "SL",
    name: "Sarah Liao",
    engagementScore: 88,
    predictedGrade: "A-",
    actualGrade: "A",
    varianceLabel: "IMPROVED",
    varianceStyle: "bg-indigo-100 text-indigo-700"
  },
  {
    initials: "JR",
    name: "James Rodriguez",
    engagementScore: 65,
    predictedGrade: "B",
    actualGrade: "B-",
    varianceLabel: "DECLINING",
    varianceStyle: "bg-sky-100 text-sky-700"
  }
];

function getLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  return "D";
}

function varianceTag(predicted: string, actual: string): { label: string; style: string } {
  if (predicted === actual) {
    return { label: "STABLE", style: "bg-emerald-100 text-emerald-700" };
  }
  const goodGrades = ["A", "A-", "B+", "B", "B-"];
  if (goodGrades.includes(actual) && !goodGrades.includes(predicted)) {
    return { label: "IMPROVED", style: "bg-indigo-100 text-indigo-700" };
  }
  return { label: "ALERT", style: "bg-red-100 text-red-700" };
}

export default function AnalyticsPage() {
  const token = useAuthGuard();
  const [semester, setSemester] = useState("Fall 2023");
  const [course, setCourse] = useState("Advanced Data Structures");
  const [metricType, setMetricType] = useState("Performance vs. Engagement");

  const overviewQuery = useQuery({
    queryKey: ["analytics-overview", token],
    queryFn: () => analyticsApi.overview(token as string),
    enabled: Boolean(token)
  });

  const atRiskQuery = useQuery({
    queryKey: ["analytics-at-risk", token],
    queryFn: () => analyticsApi.atRisk(token as string),
    enabled: Boolean(token)
  });

  const passCount = overviewQuery.data?.pass_fail_ratio.pass ?? 23;
  const failCount = overviewQuery.data?.pass_fail_ratio.fail ?? 2;
  const totalCount = passCount + failCount;
  const predictedAccuracy = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 92;
  const lowEngagementAlerts = atRiskQuery.data?.length ?? 15;
  const avgTimeOnPlatform = 4.2;
  const assessmentCompletion = Math.min(99, Math.max(70, Math.round((overviewQuery.data?.class_average ?? 88) + 2)));

  const tableRows = useMemo(() => {
    const performers = overviewQuery.data?.top_performers;
    if (!performers || performers.length === 0) {
      return fallbackRows;
    }

    return performers.slice(0, 6).map((student, index) => {
      const engagementScore = Math.max(35, Math.min(98, Math.round(student.avg_score + (index % 2 === 0 ? 8 : -12))));
      const predictedGrade = getLetterGrade(student.avg_score);
      const actualScore = Math.max(30, Math.min(100, Math.round(student.avg_score + (index % 3 === 0 ? 0 : index % 3 === 1 ? -7 : 4))));
      const actualGrade = getLetterGrade(actualScore);
      const tag = varianceTag(predictedGrade, actualGrade);

      return {
        initials: student.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        name: student.name,
        engagementScore,
        predictedGrade,
        actualGrade,
        varianceLabel: tag.label,
        varianceStyle: tag.style
      };
    });
  }, [overviewQuery.data]);

  return (
    <AppShell>
      <div className="space-y-5 fade-in">
        {/* Header */}
        <div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-navy">Analytics &amp; Insights</h2>
          <p className="mt-1 text-base text-ink-light">
            Deep dive into performance trends and predictive accuracy.
          </p>
        </div>

        {/* Controls */}
        <Card className="stagger">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Semester</p>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                <option>Fall 2023</option>
                <option>Spring 2024</option>
                <option>Summer 2024</option>
              </select>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Course</p>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                <option>Advanced Data Structures</option>
                <option>Machine Learning Fundamentals</option>
                <option>Operating Systems</option>
              </select>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Metric Type</p>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                <option>Performance vs. Engagement</option>
                <option>Prediction Confidence</option>
                <option>Risk Distribution</option>
              </select>
            </div>

            <div className="flex items-end justify-end">
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-hover transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </Card>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger">
          <Card>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Predictive Accuracy</p>
            <p className="mt-1 text-4xl font-extrabold text-navy">{predictedAccuracy}%</p>
            <div className="mt-3 h-0.5 w-full bg-border">
              <div className="h-full w-[72%] bg-navy" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-danger-soft text-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-red-100 text-red-700">
                High Priority
              </span>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Low Engagement Alerts</p>
            <p className="mt-1 text-4xl font-extrabold text-navy">{lowEngagementAlerts}</p>
            <p className="mt-1 text-xs italic text-ink-muted">3 more than last week</p>
          </Card>

          <Card>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-navy">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Avg. Time On Platform</p>
            <p className="mt-1 text-4xl font-extrabold text-navy">{avgTimeOnPlatform}</p>
            <p className="text-xs text-ink-light">hrs/wk</p>
            <div className="mt-3 h-0.5 w-full bg-border">
              <div className="h-full w-[48%] bg-navy" />
            </div>
          </Card>

          <Card>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Assessment Completion</p>
            <p className="mt-1 text-4xl font-extrabold text-navy">{assessmentCompletion}%</p>
            <div className="mt-3 h-0.5 w-full bg-border">
              <div className="h-full w-[88%] bg-teal-500" />
            </div>
          </Card>
        </div>

        {/* Chart + insight */}
        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-navy">Engagement vs. Performance</h3>
                <p className="text-sm text-ink-light">Longitudinal analysis across the current semester</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-light">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-900" />Performance</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />Engagement</span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementSeries} barGap={6} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 20, 40, 60, 80, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="performance" fill="#1f2b6e" radius={[0, 0, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="engagement" fill="#9ad8d3" radius={[0, 0, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-navy text-white shadow-[0_10px_30px_rgba(10,22,40,0.25)]">
            <h3 className="text-3xl font-bold tracking-tight">Correlation Insight</h3>
            <p className="mt-4 text-sm leading-relaxed text-blue-100">
              Students who engage with modular content for more than <span className="font-bold text-white">3.5 hours weekly</span> show a <span className="font-bold text-white">18% higher</span> likelihood of achieving an 'A' grade regardless of entry score.
            </p>

            <div className="mt-5 rounded-xl bg-white/8 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-100">Recommended Action</p>
              <p className="mt-1 text-xs text-blue-100/90">Trigger engagement prompts for students under 2hrs/wk.</p>
            </div>

            <button className="mt-6 w-full rounded-md bg-white px-4 py-3 text-sm font-semibold text-navy hover:bg-slate-100 transition-colors">
              Generate Full Insight Report
            </button>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-3xl font-bold text-navy">Student Correlation Table</h3>
            <p className="text-xs text-ink-light">
              Sort by: <span className="font-semibold text-navy">Engagement Score ↓</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Student Name</th>
                  <th className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Engagement Score</th>
                  <th className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Predicted Grade</th>
                  <th className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Actual Grade</th>
                  <th className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Variance</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.name} className="border-b border-border-light">
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-navy">
                          {row.initials}
                        </div>
                        <span className="text-sm font-semibold text-navy">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy">{row.engagementScore}/100</span>
                        <div className="h-0.5 w-16 bg-border">
                          <div
                            className={`h-full ${row.engagementScore >= 70 ? "bg-teal-500" : row.engagementScore >= 55 ? "bg-indigo-500" : "bg-red-500"}`}
                            style={{ width: `${row.engagementScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-3 text-sm font-semibold text-navy">{row.predictedGrade}</td>
                    <td className="py-4 pr-3 text-sm font-semibold text-navy">{row.actualGrade}</td>
                    <td className="py-4 pr-3">
                      <span className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${row.varianceStyle}`}>
                        {row.varianceLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <button className="text-sm font-semibold text-navy hover:text-accent transition-colors">View All Students</button>
          </div>
        </Card>

        {overviewQuery.isLoading && (
          <p className="text-xs text-ink-muted">Refreshing analytics data...</p>
        )}

        {(overviewQuery.error || atRiskQuery.error) && (
          <p className="text-xs text-danger">Unable to load some live analytics data. Showing fallback values.</p>
        )}
      </div>
    </AppShell>
  );
}
