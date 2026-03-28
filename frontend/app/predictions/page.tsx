"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { predictionApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

function getRiskVariant(risk: string): "success" | "warn" | "danger" {
  const lower = risk?.toLowerCase();
  if (lower === "high") return "danger";
  if (lower === "medium") return "warn";
  return "success";
}

export default function PredictionsPage() {
  const token = useAuthGuard();
  const [studentId, setStudentId] = useState("");

  const listQuery = useQuery({
    queryKey: ["predictions", token],
    queryFn: () => predictionApi.list(token as string),
    enabled: Boolean(token)
  });

  const predictMutation = useMutation({
    mutationFn: (id: number) => predictionApi.predict(token as string, id),
    onSuccess: () => listQuery.refetch()
  });

  const predictions = listQuery.data ?? [];

  return (
    <AppShell>
      <div className="space-y-6 fade-in">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Predictions</h2>
          <p className="mt-1 text-sm text-ink-light">
            Run grade predictions and view history
          </p>
        </div>

        {/* Predict form */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Run Prediction</h3>
              <p className="text-xs text-ink-light">Enter a student ID to predict their grade</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID"
              type="number"
            />
            <Button
              onClick={() => predictMutation.mutate(Number(studentId))}
              disabled={!studentId || predictMutation.isPending}
              className="flex-shrink-0"
            >
              {predictMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Predicting…
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run Prediction
                </>
              )}
            </Button>
          </div>

          {/* Prediction result */}
          {predictMutation.data && (
            <div className="mt-4 grid gap-3 rounded-xl border border-accent-muted bg-accent-soft p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-accent/70">Predicted Grade</p>
                <p className="mt-1 text-xl font-bold text-accent">{predictMutation.data.predicted_grade}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-accent/70">Risk Level</p>
                <div className="mt-1">
                  <Badge variant={getRiskVariant(predictMutation.data.risk_level)}>
                    {predictMutation.data.risk_level}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-accent/70">Confidence</p>
                <p className="mt-1 text-xl font-bold text-ink">{predictMutation.data.confidence}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Prediction history */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Prediction History</h3>
              <p className="text-xs text-ink-light">All previously run predictions</p>
            </div>
            <Badge variant="default">{predictions.length} records</Badge>
          </div>

          {predictions.length === 0 && !listQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-ink-light">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-ink">No predictions yet</h4>
              <p className="mt-1 max-w-xs text-xs text-ink-light">
                Run your first prediction using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.map((item, index) => (
                <div
                  key={`${item.student_id}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors duration-150 hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover text-sm font-bold text-ink-light">
                      #{item.student_id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Student {item.student_id}</p>
                      <p className="text-xs text-ink-light">
                        Grade {item.predicted_grade} • Confidence {item.confidence}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskVariant(item.risk_level)}>
                    {item.risk_level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
