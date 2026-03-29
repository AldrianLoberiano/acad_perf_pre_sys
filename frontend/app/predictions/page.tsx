"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { predictionApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

/* ── Risk badge styles ── */
function getRiskStyle(risk: string): { bg: string; text: string; label: string; barColor: string } {
  const lower = risk?.toLowerCase();
  if (lower === "high") return { bg: "bg-red-100", text: "text-red-700", label: "HIGH RISK", barColor: "bg-red-500" };
  if (lower === "medium") return { bg: "bg-amber-100", text: "text-amber-700", label: "MEDIUM RISK", barColor: "bg-amber-500" };
  return { bg: "bg-emerald-100", text: "text-emerald-700", label: "LOW RISK", barColor: "bg-emerald-500" };
}

/* ── Demo predictions for empty-state fallback ── */
const demoPredictions = [
  { student_id: 8, predicted_grade: "B", confidence: 0.99, risk_level: "Low", time: "2 hours ago" },
  { student_id: 3, predicted_grade: "C-", confidence: 0.84, risk_level: "Medium", time: "4 hours ago" },
  { student_id: 1, predicted_grade: "F", confidence: 0.92, risk_level: "High", time: "Yesterday" },
  { student_id: 12, predicted_grade: "A", confidence: 0.97, risk_level: "Low", time: "Mar 12, 2024" },
  { student_id: 5, predicted_grade: "B+", confidence: 0.88, risk_level: "Low", time: "Mar 11, 2024" }
];

const idColors = ["#1e3a5f", "#2563eb", "#059669", "#7c3aed", "#d97706"];

/* ── Simulated factor data for the detailed report ── */
function getFactors(grade: string, confidence: number, risk: string) {
  const lower = risk?.toLowerCase();
  const attendance = lower === "high" ? 42 : lower === "medium" ? 65 : 88 + Math.floor(Math.random() * 10);
  const lms = lower === "high" ? 28 : lower === "medium" ? 55 : 75 + Math.floor(Math.random() * 20);
  const midterm = lower === "high" ? 35 : lower === "medium" ? 58 : 70 + Math.floor(Math.random() * 25);
  const assignments = lower === "high" ? 30 : lower === "medium" ? 62 : 80 + Math.floor(Math.random() * 15);
  const participation = lower === "high" ? 25 : lower === "medium" ? 50 : 72 + Math.floor(Math.random() * 20);
  return { attendance, lms, midterm, assignments, participation };
}

type SelectedPrediction = {
  student_id: number;
  predicted_grade: string;
  confidence: number;
  risk_level: string;
  time: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getStudentProfile(studentId: number): { name: string; program: string; year: number } {
  const names = [
    "Marcus Holloway",
    "Elena Rodriguez",
    "Kaito Tanaka",
    "Sarah Jenkins",
    "Eleanor Vance"
  ];
  const programs = [
    "BSc Computer Science",
    "Data Science",
    "Applied Mathematics",
    "Business Analytics",
    "Cognitive Psychology"
  ];

  return {
    name: names[studentId % names.length],
    program: programs[studentId % programs.length],
    year: (studentId % 4) + 1
  };
}

function getInterventions(riskLevel: string): Array<{ title: string; description: string; tag: string }> {
  const risk = riskLevel.toLowerCase();
  if (risk === "high") {
    return [
      {
        title: "Schedule 1-on-1 Review",
        description: "Address the recent drop in engagement and define a weekly accountability target.",
        tag: "High Impact"
      },
      {
        title: "Assign Peer Tutoring",
        description: "Pair with a high-performing peer to close concept gaps in core modules.",
        tag: "Social Support"
      }
    ];
  }
  if (risk === "medium") {
    return [
      {
        title: "Weekly Progress Check",
        description: "Set short milestone check-ins focused on attendance and assignment completion.",
        tag: "Structured Follow-up"
      },
      {
        title: "Targeted Practice Plan",
        description: "Provide focused practice set based on weakest performance indicators.",
        tag: "Focused Practice"
      }
    ];
  }
  return [
    {
      title: "Maintain Momentum",
      description: "Keep current study rhythm and reinforce strong participation behavior.",
      tag: "Performance Keep"
    },
    {
      title: "Leadership Opportunity",
      description: "Invite student to peer mentoring to sustain confidence and deepen mastery.",
      tag: "Growth Track"
    }
  ];
}

export default function PredictionsPage() {
  const token = useAuthGuard();
  const [studentId, setStudentId] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState<SelectedPrediction | null>(null);

  useEffect(() => {
    if (!selectedPrediction) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPrediction(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPrediction]);

  const listQuery = useQuery({
    queryKey: ["predictions", token],
    queryFn: () => predictionApi.list(token as string),
    enabled: Boolean(token)
  });

  const predictMutation = useMutation({
    mutationFn: (id: number) => predictionApi.predict(token as string, id),
    onSuccess: (data) => {
      listQuery.refetch();
      // Auto-open report with result
      setSelectedPrediction({
        student_id: Number(studentId),
        predicted_grade: data.predicted_grade,
        confidence: data.confidence,
        risk_level: data.risk_level,
        time: "Just now"
      });
    }
  });

  const apiPredictions = listQuery.data ?? [];
  const hasPredictions = apiPredictions.length > 0;

  const displayPredictions = hasPredictions
    ? apiPredictions.map((p, i) => ({
        student_id: p.student_id,
        predicted_grade: p.predicted_grade,
        confidence: p.confidence,
        risk_level: p.risk_level,
        time: i === 0 ? "Just now" : i === 1 ? "2 hours ago" : `${i + 1} hours ago`
      }))
    : demoPredictions;

  return (
    <AppShell>
      <div className="fade-in">
        {/* ═══ Page Header ═══ */}
        <div className="mb-6">
          <h2 className="font-display text-3xl font-extrabold text-ink">
            Scholar Insight Engine
          </h2>
          <p className="mt-2 text-sm text-ink-light max-w-2xl leading-relaxed">
            Run grade predictions based on historical behavioral data and view current academic risk trajectories.
          </p>
        </div>

        {/* ═══ Main: Form + Predictions ═══ */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* ─── Left Column: Run Analysis + Model Reliability ─── */}
          <div className="space-y-5">
            {/* Run New Analysis Card */}
            <Card>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Run New Analysis</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">
                    Predictive Modeling V4.2
                  </p>
                </div>
              </div>

              {/* Student ID Input */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1.5">
                  Student Identification
                </label>
                <div className="relative">
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2024-9981"
                    type="number"
                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all pr-10"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    <path d="M18.5 20.5c0-2.5-2.5-4-4.5-4s-4.5 1.5-4.5 4" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                </div>
              </div>

              {/* Info notice */}
              <div className="rounded-xl bg-surface-muted border border-border-light p-4 mb-5">
                <div className="flex gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                      <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="text-xs text-ink-light leading-relaxed">
                    Analysis accounts for{" "}
                    <span className="font-semibold text-ink">attendance</span>,{" "}
                    <span className="font-semibold text-ink">LMS activity</span>,
                    and{" "}
                    <span className="font-semibold text-ink">mid-term assessments</span>.
                    Results represent a statistical probability.
                  </p>
                </div>
              </div>

              {/* Run Prediction Button */}
              <button
                onClick={() => predictMutation.mutate(Number(studentId))}
                disabled={!studentId || predictMutation.isPending}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-navy py-3.5 text-sm font-semibold text-white transition-all hover:bg-navy-light active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {predictMutation.isPending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Running Analysis…
                  </>
                ) : (
                  <>
                    Run Prediction
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </Card>

            {/* Current Model Reliability */}
            <div className="px-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-3">
                Current Model Reliability
              </p>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink">System Confidence</span>
                  <span className="text-sm font-bold text-ink">94.2%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-navy" style={{ width: "94.2%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Recent Predictions ─── */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-ink">Recent Predictions</h3>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-light hover:bg-surface-hover transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-light hover:bg-surface-hover transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Prediction cards */}
            <div className="space-y-3">
              {displayPredictions.map((item, index) => {
                const risk = getRiskStyle(item.risk_level);
                const colorIdx = index % idColors.length;
                const isSelected = selectedPrediction?.student_id === item.student_id;

                return (
                  <button
                    key={`${item.student_id}-${index}`}
                    onClick={() => setSelectedPrediction(item)}
                    className={`w-full flex items-center gap-4 rounded-2xl border p-4 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-left ${
                      isSelected
                        ? "border-accent bg-accent-soft ring-2 ring-accent/20"
                        : "border-border bg-surface"
                    }`}
                  >
                    {/* Student ID badge */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: idColors[colorIdx] }}
                    >
                      #{item.student_id}
                    </div>

                    {/* Student info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-ink">Student {item.student_id}</p>
                      <p className="text-xs text-ink-light mt-0.5">
                        Grade {item.predicted_grade} • Confidence {item.confidence}
                      </p>
                    </div>

                    {/* Risk badge + time */}
                    <div className="text-right shrink-0">
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                      <p className="text-[11px] text-ink-muted mt-1">{item.time}</p>
                    </div>
                  </button>
                );
              })}

              {displayPredictions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-ink-light">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-ink">No predictions yet</h4>
                  <p className="mt-1 max-w-xs text-xs text-ink-light">
                    Run your first prediction using the form.
                  </p>
                </div>
              )}
            </div>

            {/* View All */}
            <button className="mt-4 w-full py-3 text-center text-sm font-semibold text-ink hover:text-accent transition-colors">
              View All Prediction History
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ═══ DETAILED PREDICTION REPORT ═══ */}
        {/* ═══════════════════════════════════════════════════════ */}
        {selectedPrediction && (() => {
          const risk = getRiskStyle(selectedPrediction.risk_level);
          const factors = getFactors(
            selectedPrediction.predicted_grade,
            selectedPrediction.confidence,
            selectedPrediction.risk_level
          );
          const profile = getStudentProfile(selectedPrediction.student_id);
          const initials = profile.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const confidencePercent = Number((selectedPrediction.confidence * 100).toFixed(1));
          const engagementScore = clamp(factors.lms, 0, 100);
          const attendanceRate = clamp(factors.attendance, 0, 100);
          const assessmentAverage = clamp(Math.round((factors.midterm + factors.assignments + factors.participation) / 3), 0, 100);

          const narrativeData = [
            { week: "Week 1", grades: clamp(assessmentAverage - 6, 20, 98), activity: clamp(engagementScore + 26, 10, 98) },
            { week: "Week 2", grades: clamp(assessmentAverage - 5, 20, 98), activity: clamp(engagementScore + 24, 10, 98) },
            { week: "Week 3", grades: clamp(assessmentAverage - 1, 20, 98), activity: clamp(engagementScore + 8, 10, 98) },
            { week: "Week 4", grades: clamp(assessmentAverage - 3, 20, 98), activity: clamp(engagementScore - 8, 10, 98) },
            { week: "Week 5", grades: clamp(assessmentAverage - 6, 20, 98), activity: clamp(engagementScore - 20, 10, 98) },
            { week: "Week 6", grades: clamp(assessmentAverage - 8, 20, 98), activity: clamp(engagementScore - 26, 10, 98) }
          ];

          const technicalProficiency = clamp(Math.round((assessmentAverage + factors.midterm) / 2), 0, 100);
          const submissionTimeliness = clamp(Math.round((factors.assignments + factors.attendance) / 2), 0, 100);
          const interventions = getInterventions(selectedPrediction.risk_level);

          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 md:p-7">
              <button
                type="button"
                aria-label="Close prediction report"
                onClick={() => setSelectedPrediction(null)}
                className="absolute inset-0 bg-navy/45"
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-label="Detailed prediction report"
                className="relative z-10 w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl border border-border bg-paper p-4 shadow-2xl fade-in sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-ink-light">Predictions / Detailed Analysis</p>
                    <h3 className="mt-0.5 text-3xl font-extrabold text-navy">{profile.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-light hover:bg-surface-hover hover:text-ink transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Header cards */}
                <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                  <Card className="shadow-none">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-navy text-2xl font-extrabold text-white">
                        {initials}
                      </div>

                      <div className="min-w-[240px] flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          Student ID: STU-{String(selectedPrediction.student_id).padStart(4, "0")}
                        </p>
                        <h4 className="mt-1 text-4xl font-extrabold text-navy">{profile.name}</h4>
                        <p className="text-sm text-ink-light">{profile.program} • Year {profile.year}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700">
                            {risk.label}
                          </span>
                          <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-surface-muted text-ink-light">
                            {selectedPrediction.predicted_grade} Predicted Grade
                          </span>
                          <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-accent-soft text-accent">
                            Active Enrollment
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-navy text-white shadow-none">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Prediction Confidence</p>
                    <p className="mt-2 text-display leading-none text-white">{confidencePercent}%</p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-white/75">
                      <span>High Reliability</span>
                      <span>Strong Data Signal</span>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${confidencePercent}%` }} />
                    </div>
                  </Card>
                </div>

                {/* KPI cards */}
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Engagement Score",
                      value: engagementScore,
                      unit: "/100",
                      trend: engagementScore < 55 ? "Declining" : "Improving",
                      trendClass: engagementScore < 55 ? "text-red-600" : "text-emerald-600",
                      barClass: engagementScore < 55 ? "bg-red-500" : "bg-emerald-500"
                    },
                    {
                      title: "Attendance Rate",
                      value: attendanceRate,
                      unit: "%",
                      trend: attendanceRate < 80 ? "Critical Zone" : "On Track",
                      trendClass: attendanceRate < 80 ? "text-red-600" : "text-emerald-600",
                      barClass: attendanceRate < 80 ? "bg-red-500" : "bg-indigo-500"
                    },
                    {
                      title: "Assessment Average",
                      value: assessmentAverage,
                      unit: "%",
                      trend: assessmentAverage >= 70 ? "Stable" : "Watch",
                      trendClass: assessmentAverage >= 70 ? "text-emerald-600" : "text-amber-600",
                      barClass: assessmentAverage >= 70 ? "bg-indigo-500" : "bg-amber-500"
                    }
                  ].map((metric) => (
                    <Card key={metric.title} className="shadow-none">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{metric.title}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${metric.trendClass}`}>{metric.trend}</span>
                      </div>
                      <div className="mt-3 flex items-end gap-1">
                        <p className="text-4xl font-extrabold text-navy">{metric.value}</p>
                        <span className="pb-1 text-sm font-semibold text-ink-light">{metric.unit}</span>
                      </div>
                      <div className="mt-3 h-0.5 w-full bg-border">
                        <div className={`h-full ${metric.barClass}`} style={{ width: `${metric.value}%` }} />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Narrative + peer comparison */}
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
                  <Card className="shadow-none">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-navy">Behavioral Narrative</h4>
                        <p className="text-xs text-ink-light">6-week engagement vs. assessment trend</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-light">
                        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-900" />Grades</span>
                        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />Activity</span>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={narrativeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ef" vertical={false} />
                          <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                              fontSize: "12px"
                            }}
                          />
                          <Line type="monotone" dataKey="grades" stroke="#101f73" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="activity" stroke="#2a9d8f" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="shadow-none">
                    <h4 className="text-lg font-bold text-navy">Peer Comparison</h4>
                    <p className="text-xs text-ink-light">Performance vs. class median</p>

                    <div className="mt-6 space-y-6">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm font-semibold text-navy">
                          <span>Technical Proficiency</span>
                          <span>{profile.name.split(" ")[0]}: {technicalProficiency}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-border">
                          <div className="h-full rounded-full bg-indigo-900" style={{ width: `${technicalProficiency}%` }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                          <span>Below Average</span>
                          <span>Class Median (82%)</span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm font-semibold text-navy">
                          <span>Submission Timeliness</span>
                          <span>{profile.name.split(" ")[0]}: {submissionTimeliness}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-border">
                          <div className="h-full rounded-full bg-red-600" style={{ width: `${submissionTimeliness}%` }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                          <span>Low Participation</span>
                          <span>Class Median (74%)</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Interventions */}
                <div className="mt-4 rounded-2xl bg-navy p-5 text-white">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">Insight Engine Recommendations</p>
                      <h4 className="mt-1 text-4xl font-extrabold">Tailored Interventions</h4>
                    </div>
                    <button className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-slate-100 transition-colors">
                      Execute Full Plan
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {interventions.map((item) => (
                      <div key={item.title} className="rounded-xl border border-white/10 bg-white/10 p-4">
                        <p className="text-lg font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-white/75">{item.description}</p>
                        <span className="mt-3 inline-block rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-200">
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ Footer ═══ */}
        <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs text-ink-muted">© 2024 Academic Signal Studio</span>
            <button className="text-xs text-ink-light font-medium hover:text-accent transition-colors">Privacy Protocol</button>
            <button className="text-xs text-ink-light font-medium hover:text-accent transition-colors">API Documentation</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">
              Core Engine Status: Operational
            </span>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
