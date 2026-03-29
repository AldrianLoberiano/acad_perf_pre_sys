"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

type TeacherSummary = {
  name: string;
  studentCount: number;
  sections: string[];
  courses: string[];
};

function buildTeacherSummary(students: Array<{ teacher?: string | null; section?: string | null; course: string }>): TeacherSummary[] {
  const byTeacher = new Map<string, { studentCount: number; sections: Set<string>; courses: Set<string> }>();

  for (const student of students) {
    const teacher = (student.teacher || "Unassigned").trim() || "Unassigned";

    if (!byTeacher.has(teacher)) {
      byTeacher.set(teacher, {
        studentCount: 0,
        sections: new Set<string>(),
        courses: new Set<string>()
      });
    }

    const entry = byTeacher.get(teacher)!;
    entry.studentCount += 1;
    entry.courses.add(student.course);

    if (student.section && student.section.trim()) {
      entry.sections.add(student.section.trim());
    }
  }

  return Array.from(byTeacher.entries())
    .map(([name, value]) => ({
      name,
      studentCount: value.studentCount,
      sections: Array.from(value.sections).sort(),
      courses: Array.from(value.courses).sort()
    }))
    .sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name));
}

export default function TeachersPage() {
  const token = useAuthGuard();

  const studentsQuery = useQuery({
    queryKey: ["students", token, "teachers-page"],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const teacherRows = buildTeacherSummary(studentsQuery.data ?? []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Faculty Management</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Teacher Directory</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            Overview of assigned teachers, their sections, and course coverage based on current student records.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Total Teachers</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{teacherRows.length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Assigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{(studentsQuery.data ?? []).length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Unassigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-danger">
              {(studentsQuery.data ?? []).filter((student) => !student.teacher || !student.teacher.trim()).length}
            </p>
          </Card>
        </div>

        <Card className="shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">Teacher Workload</h3>
            {studentsQuery.isLoading && <span className="text-xs text-ink-light">Loading...</span>}
          </div>

          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-[minmax(220px,1fr)_120px_minmax(160px,1fr)_minmax(220px,1fr)] gap-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
              <span>Teacher</span>
              <span>Students</span>
              <span>Sections</span>
              <span>Courses</span>
            </div>

            {teacherRows.map((teacher) => (
              <div
                key={teacher.name}
                className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(220px,1fr)_120px_minmax(160px,1fr)_minmax(220px,1fr)] md:items-center"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{teacher.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{teacher.studentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-light">{teacher.sections.length ? teacher.sections.join(", ") : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-light">{teacher.courses.join(", ")}</p>
                </div>
              </div>
            ))}

            {!studentsQuery.isLoading && teacherRows.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-10 text-center">
                <p className="text-sm font-semibold text-ink">No teacher data yet</p>
                <p className="mt-1 text-xs text-ink-light">Add students with teacher names from the Student Directory to populate this view.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
