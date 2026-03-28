"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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
          const colorIdx = selectedPrediction.student_id % idColors.length;

          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-8">
              <button
                type="button"
                aria-label="Close prediction report"
                onClick={() => setSelectedPrediction(null)}
                className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-label="Detailed prediction report"
                className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl fade-in sm:p-6 md:p-7"
              >
                {/* Report Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-ink">Detailed Prediction Report</h3>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">
                        Student #{selectedPrediction.student_id} • Generated {selectedPrediction.time}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-muted">Press Esc to close</p>
                    </div>
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

                {/* Report Grid */}
                <div className="grid gap-5 lg:grid-cols-3">
                  {/* ── Column 1: Summary Card ── */}
                  <Card className="lg:row-span-2">
                    <div className="text-center pb-4 border-b border-border mb-4">
                      <div
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-white mb-3"
                        style={{ backgroundColor: idColors[colorIdx] }}
                      >
                        #{selectedPrediction.student_id}
                      </div>
                      <h4 className="text-lg font-bold text-ink">Student {selectedPrediction.student_id}</h4>
                      <p className="text-xs text-ink-light mt-0.5">Academic Performance Analysis</p>
                    </div>

                    {/* Grade */}
                    <div className="text-center mb-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1">
                        Predicted Grade
                      </p>
                      <span className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-navy text-white text-2xl font-extrabold">
                        {selectedPrediction.predicted_grade}
                      </span>
                    </div>

                    {/* Risk Level */}
                    <div className="text-center mb-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-2">
                        Risk Assessment
                      </p>
                      <span className={`inline-block rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-ink-light">Confidence Score</span>
                        <span className="text-sm font-bold text-ink">{(selectedPrediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-700"
                          style={{ width: `${selectedPrediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* ── Column 2: Contributing Factors ── */}
                  <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="text-base font-bold text-ink">Contributing Factors</h4>
                        <p className="text-xs text-ink-light mt-0.5">Breakdown of input signals used in prediction</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-ink-light">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Attendance Rate", value: factors.attendance, icon: "" },
                        { label: "LMS Activity Score", value: factors.lms, icon: "" },
                        { label: "Mid-term Assessment", value: factors.midterm, icon: "" },
                        { label: "Assignment Completion", value: factors.assignments, icon: "📚" },
                        { label: "Class Participation", value: factors.participation, icon: "🎓" }
                      ].map((factor) => (
                        <div key={factor.label}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{factor.icon}</span>
                              <span className="text-sm font-medium text-ink">{factor.label}</span>
                            </div>
                            <span className={`text-sm font-bold ${
                              factor.value >= 80 ? "text-emerald-600" :
                              factor.value >= 60 ? "text-amber-600" : "text-red-600"
                            }`}>
                              {factor.value}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                factor.value >= 80 ? "bg-emerald-500" :
                                factor.value >= 60 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${factor.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* ── Column 2 Row 2: Recommendations ── */}
                  <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-base font-bold text-ink">Intervention Recommendations</h4>
                        <p className="text-xs text-ink-light mt-0.5">AI-generated action items based on analysis</p>
                      </div>
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedPrediction.risk_level?.toLowerCase() === "high" ? (
                        <>
                          <RecommendationItem
                            priority="critical"
                            title="Immediate Academic Counseling"
                            description="Schedule a one-on-one meeting with academic advisor within 48 hours to address performance gaps."
                          />
                          <RecommendationItem
                            priority="critical"
                            title="Attendance Monitoring"
                            description="Implement mandatory attendance tracking and weekly check-ins with course instructor."
                          />
                          <RecommendationItem
                            priority="high"
                            title="Peer Tutoring Assignment"
                            description="Assign a peer tutor from the excellence circle for supplementary academic support."
                          />
                          <RecommendationItem
                            priority="medium"
                            title="LMS Engagement Plan"
                            description="Create a structured weekly schedule for completing online coursework and resource reviews."
                          />
                        </>
                      ) : selectedPrediction.risk_level?.toLowerCase() === "medium" ? (
                        <>
                          <RecommendationItem
                            priority="high"
                            title="Academic Progress Review"
                            description="Schedule bi-weekly progress check-ins with course coordinator to monitor improvement."
                          />
                          <RecommendationItem
                            priority="medium"
                            title="Study Group Enrollment"
                            description="Recommend enrollment in departmental study groups to strengthen collaborative learning."
                          />
                          <RecommendationItem
                            priority="low"
                            title="Resource Utilization"
                            description="Encourage regular use of library resources and supplementary course materials."
                          />
                        </>
                      ) : (
                        <>
                          <RecommendationItem
                            priority="low"
                            title="Maintain Current Trajectory"
                            description="Student is performing well. Continue monitoring and encourage sustained engagement."
                          />
                          <RecommendationItem
                            priority="low"
                            title="Advanced Opportunities"
                            description="Consider recommending for honors track, research assistantship, or mentorship programs."
                          />
                          <RecommendationItem
                            priority="low"
                            title="Peer Leadership"
                            description="Nominate as a potential peer tutor or study group leader to support at-risk students."
                          />
                        </>
                      )}
                    </div>
                  </Card>
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

/* ── Recommendation Item Component ── */
function RecommendationItem({
  priority,
  title,
  description
}: {
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
}) {
  const priorityStyles = {
    critical: { dot: "bg-red-500", badge: "bg-red-100 text-red-700", label: "Critical" },
    high: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700", label: "High" },
    medium: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700", label: "Medium" },
    low: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "Suggested" }
  };

  const style = priorityStyles[priority];

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-border hover:bg-surface-hover transition-colors">
      <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${style.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <span className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${style.badge}`}>
            {style.label}
          </span>
        </div>
        <p className="text-xs text-ink-light leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
