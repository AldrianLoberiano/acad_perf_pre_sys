"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { predictionApi, studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

function formatTimestamp(value?: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

export default function PredictionsPage() {
  const token = useAuthGuard();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students", token, "predictions-page"],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const predictionsQuery = useQuery({
    queryKey: ["predictions", token],
    queryFn: () => predictionApi.list(token as string),
    enabled: Boolean(token)
  });

  const latestPredictionByStudent = useMemo(() => {
    const map = new Map<number, { grade: string; createdAt?: string }>();

    for (const prediction of predictionsQuery.data ?? []) {
      if (!map.has(prediction.student_id)) {
        map.set(prediction.student_id, {
          grade: prediction.predicted_grade,
          createdAt: prediction.created_at
        });
      }
    }

    return map;
  }, [predictionsQuery.data]);

  const filteredStudents = useMemo(() => {
    const students = studentsQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return students;
    }

    return students.filter((student) => {
      const teacher = student.teacher || "";
      const section = student.section || "";

      return (
        student.name.toLowerCase().includes(term) ||
        student.course.toLowerCase().includes(term) ||
        teacher.toLowerCase().includes(term) ||
        section.toLowerCase().includes(term) ||
        String(student.id).includes(term)
      );
    });
  }, [studentsQuery.data, searchTerm]);

  const predictMutation = useMutation({
    mutationFn: (studentId: number) => predictionApi.predict(token as string, studentId),
    onMutate: (studentId) => {
      setActiveStudentId(studentId);
      setNotice(null);
    },
    onSuccess: (result, studentId) => {
      const studentName = (studentsQuery.data ?? []).find((item) => item.id === studentId)?.name || `Student ${studentId}`;
      setNotice({
        type: "success",
        message: `Predicted grade ${result.predicted_grade} for ${studentName}.`
      });
      queryClient.invalidateQueries({ queryKey: ["predictions", token] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Prediction failed"
          : "Prediction failed";
      setNotice({ type: "error", message });
    },
    onSettled: () => {
      setActiveStudentId(null);
    }
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Grade Prediction</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Individual Student Grade Predictor</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            Predict only the grade for each student, one student at a time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{(studentsQuery.data ?? []).length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Predicted Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{latestPredictionByStudent.size}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Ready For Prediction</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">
              {Math.max(0, (studentsQuery.data ?? []).length - latestPredictionByStudent.size)}
            </p>
          </Card>
        </div>

        {notice && (
          <Card className="shadow-none">
            <p className={`text-sm font-semibold ${notice.type === "error" ? "text-danger" : "text-success"}`}>
              {notice.message}
            </p>
          </Card>
        )}

        <Card className="shadow-none">
          <div className="mb-4 flex items-center gap-3">
            <svg className="text-ink-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by student name, course, teacher, section, or ID"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-[70px_minmax(200px,1fr)_minmax(180px,1fr)_100px_140px_170px] gap-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
              <span>ID</span>
              <span>Student</span>
              <span>Course</span>
              <span>Section</span>
              <span>Latest Grade</span>
              <span>Action</span>
            </div>

            {filteredStudents.map((student) => {
              const latest = latestPredictionByStudent.get(student.id);
              const isPending = activeStudentId === student.id && predictMutation.isPending;

              return (
                <div
                  key={student.id}
                  className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[70px_minmax(200px,1fr)_minmax(180px,1fr)_100px_140px_170px] md:items-center"
                >
                  <p className="text-sm font-semibold text-ink">{student.id}</p>
                  <div>
                    <p className="text-sm font-bold text-ink">{student.name}</p>
                    <p className="text-xs text-ink-light">Teacher: {student.teacher || "Unassigned"}</p>
                  </div>
                  <p className="text-sm text-ink-light">{student.course}</p>
                  <p className="text-sm text-ink">{student.section || "-"}</p>
                  <div>
                    <p className="text-sm font-semibold text-ink">{latest?.grade || "Not predicted"}</p>
                    <p className="text-[11px] text-ink-muted">{formatTimestamp(latest?.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => predictMutation.mutate(student.id)}
                    disabled={predictMutation.isPending}
                    className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Predicting..." : "Predict Grade"}
                  </button>
                </div>
              );
            })}

            {!studentsQuery.isLoading && filteredStudents.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-10 text-center">
                <p className="text-sm font-semibold text-ink">No students found</p>
                <p className="mt-1 text-xs text-ink-light">Try another search query.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
