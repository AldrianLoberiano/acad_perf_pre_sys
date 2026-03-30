"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { predictionApi, studentsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
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

export default function TeachersPage() {
  const token = useAuthGuard();
  const user = useAuthStore((state) => state.user);
  const [teacherFilter, setTeacherFilter] = useState<string>("All Teachers");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students", token, "teachers-page"],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const predictionsQuery = useQuery({
    queryKey: ["predictions", token, "teachers-page"],
    queryFn: () => predictionApi.list(token as string),
    enabled: Boolean(token)
  });

  const latestPredictionByStudent = useMemo(() => {
    const map = new Map<number, { grade: string; confidence?: number; createdAt?: string }>();

    for (const prediction of predictionsQuery.data ?? []) {
      if (!map.has(prediction.student_id)) {
        map.set(prediction.student_id, {
          grade: prediction.predicted_grade,
          confidence: prediction.confidence,
          createdAt: prediction.created_at
        });
      }
    }

    return map;
  }, [predictionsQuery.data]);

  const teacherOptions = useMemo(() => {
    const set = new Set<string>();
    for (const student of studentsQuery.data ?? []) {
      const teacher = (student.teacher || "").trim();
      if (teacher) {
        set.add(teacher);
      }
    }

    return ["All Teachers", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [studentsQuery.data]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return (studentsQuery.data ?? []).filter((student) => {
      const teacher = (student.teacher || "Unassigned").trim() || "Unassigned";

      if (teacherFilter !== "All Teachers" && teacher !== teacherFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        student.name.toLowerCase().includes(term) ||
        student.course.toLowerCase().includes(term) ||
        teacher.toLowerCase().includes(term) ||
        (student.section || "").toLowerCase().includes(term) ||
        String(student.id).includes(term)
      );
    });
  }, [searchTerm, studentsQuery.data, teacherFilter]);

  const activeStudent = useMemo(() => {
    if (!activeStudentId) {
      return null;
    }
    return filteredStudents.find((item) => item.id === activeStudentId) || null;
  }, [activeStudentId, filteredStudents]);

  const totalTeachers = teacherOptions.length - 1;
  const totalStudents = (studentsQuery.data ?? []).length;
  const unassignedStudents = (studentsQuery.data ?? []).filter((student) => !student.teacher || !student.teacher.trim()).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Teacher Side</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Teacher Workspace</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            View student information, monitor assigned cohorts, and review latest prediction outcomes.
          </p>
          <p className="mt-1 text-xs text-ink-muted">Signed in as: {user?.username || "Unknown"} ({user?.role || "-"})</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Teachers</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{totalTeachers}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{totalStudents}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Unassigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-danger">{unassignedStudents}</p>
          </Card>
        </div>

        <Card className="shadow-none">
          <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <select
              value={teacherFilter}
              onChange={(event) => {
                setTeacherFilter(event.target.value);
                setActiveStudentId(null);
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              {teacherOptions.map((teacherName) => (
                <option key={teacherName} value={teacherName}>
                  {teacherName}
                </option>
              ))}
            </select>

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search students by name, course, section, teacher, or ID"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-[70px_minmax(180px,1fr)_minmax(170px,1fr)_100px_130px_120px_90px] gap-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
              <span>ID</span>
              <span>Student</span>
              <span>Course</span>
              <span>Section</span>
              <span>Teacher</span>
              <span>Latest Grade</span>
              <span>View</span>
            </div>

            {filteredStudents.map((student) => {
              const latest = latestPredictionByStudent.get(student.id);
              const teacher = (student.teacher || "Unassigned").trim() || "Unassigned";

              return (
                <div
                  key={student.id}
                  className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[70px_minmax(180px,1fr)_minmax(170px,1fr)_100px_130px_120px_90px] md:items-center"
                >
                  <p className="text-sm font-semibold text-ink">{student.id}</p>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{student.name}</p>
                    <p className="text-xs text-ink-light">Age {student.age}</p>
                  </div>

                  <p className="truncate text-sm text-ink-light">{student.course}</p>
                  <p className="text-sm text-ink">{student.section || "-"}</p>
                  <p className="truncate text-sm text-ink">{teacher}</p>

                  <div>
                    <p className="text-sm font-semibold text-ink">{latest?.grade || "Not predicted"}</p>
                    <p className="text-[11px] text-ink-muted">
                      {latest?.confidence !== undefined ? `${Math.round((latest.confidence || 0) * 100)}% conf.` : "-"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStudentId(student.id)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-hover"
                  >
                    Details
                  </button>
                </div>
              );
            })}

            {!studentsQuery.isLoading && filteredStudents.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-10 text-center">
                <p className="text-sm font-semibold text-ink">No students found</p>
                <p className="mt-1 text-xs text-ink-light">Try a different teacher filter or search term.</p>
              </div>
            )}
          </div>
        </Card>

        {activeStudent && (
          <Card className="shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Student Information</h3>
              <button
                type="button"
                onClick={() => setActiveStudentId(null)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-hover"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Name</p>
                <p className="mt-1 text-sm font-bold text-ink">{activeStudent.name}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Student ID</p>
                <p className="mt-1 text-sm font-bold text-ink">{activeStudent.id}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Course</p>
                <p className="mt-1 text-sm font-bold text-ink">{activeStudent.course}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Section</p>
                <p className="mt-1 text-sm font-bold text-ink">{activeStudent.section || "-"}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Teacher</p>
                <p className="mt-1 text-sm font-bold text-ink">{activeStudent.teacher || "Unassigned"}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Latest Prediction Timestamp</p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {formatTimestamp(latestPredictionByStudent.get(activeStudent.id)?.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
