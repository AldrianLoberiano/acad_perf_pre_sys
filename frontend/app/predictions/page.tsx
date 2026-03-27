"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { predictionApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

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

  return (
    <AppShell>
      <div className="space-y-4 fade-in">
        <h2 className="font-display text-2xl font-bold">Predictions</h2>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Predict by Student ID</h3>
          <div className="flex gap-2">
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID" type="number" />
            <Button
              onClick={() => predictMutation.mutate(Number(studentId))}
              disabled={!studentId || predictMutation.isPending}
            >
              {predictMutation.isPending ? "Predicting..." : "Run Prediction"}
            </Button>
          </div>
          {predictMutation.data ? (
            <div className="mt-4 rounded-xl bg-accentSoft p-3 text-sm">
              <p><strong>Grade:</strong> {predictMutation.data.predicted_grade}</p>
              <p><strong>Risk:</strong> {predictMutation.data.risk_level}</p>
              <p><strong>Confidence:</strong> {predictMutation.data.confidence}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Prediction History</h3>
          <div className="space-y-2">
            {(listQuery.data ?? []).map((item, index) => (
              <div key={`${item.student_id}-${index}`} className="rounded-lg border border-ink/10 px-3 py-2">
                <p className="font-semibold">Student {item.student_id}</p>
                <p className="text-sm text-ink/70">
                  Grade {item.predicted_grade} • Risk {item.risk_level} • Confidence {item.confidence}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
