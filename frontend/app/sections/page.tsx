"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

type SectionSummary = {
  name: string;
  studentCount: number;
  teachers: string[];
  courses: string[];
};

function buildSectionSummary(
  students: Array<{ section?: string | null; teacher?: string | null; course: string }>
): SectionSummary[] {
  const bySection = new Map<string, { studentCount: number; teachers: Set<string>; courses: Set<string> }>();

  for (const student of students) {
    const section = (student.section || "Unassigned").trim() || "Unassigned";

    if (!bySection.has(section)) {
      bySection.set(section, {
        studentCount: 0,
        teachers: new Set<string>(),
        courses: new Set<string>()
      });
    }

    const entry = bySection.get(section)!;
    entry.studentCount += 1;
    entry.courses.add(student.course);

    if (student.teacher && student.teacher.trim()) {
      entry.teachers.add(student.teacher.trim());
    }
  }

  return Array.from(bySection.entries())
    .map(([name, value]) => ({
      name,
      studentCount: value.studentCount,
      teachers: Array.from(value.teachers).sort(),
      courses: Array.from(value.courses).sort()
    }))
    .sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name));
}

export default function SectionsPage() {
  const token = useAuthGuard();

  const studentsQuery = useQuery({
    queryKey: ["students", token, "sections-page"],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const sectionRows = buildSectionSummary(studentsQuery.data ?? []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Section Management</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Section Directory</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            Overview of all sections, student volume, assigned teachers, and course composition.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Total Sections</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{sectionRows.length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Assigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{(studentsQuery.data ?? []).length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Unassigned Sections</p>
            <p className="mt-2 text-3xl font-extrabold text-danger">
              {(studentsQuery.data ?? []).filter((student) => !student.section || !student.section.trim()).length}
            </p>
          </Card>
        </div>

        <Card className="shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">Section Workload</h3>
            {studentsQuery.isLoading && <span className="text-xs text-ink-light">Loading...</span>}
          </div>

          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-[100px_120px_minmax(220px,1fr)_minmax(220px,1fr)] gap-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
              <span>Section</span>
              <span>Students</span>
              <span>Teachers</span>
              <span>Courses</span>
            </div>

            {sectionRows.map((section) => (
              <div
                key={section.name}
                className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[100px_120px_minmax(220px,1fr)_minmax(220px,1fr)] md:items-center"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{section.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{section.studentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-light">{section.teachers.length ? section.teachers.join(", ") : "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-light">{section.courses.join(", ")}</p>
                </div>
              </div>
            ))}

            {!studentsQuery.isLoading && sectionRows.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-10 text-center">
                <p className="text-sm font-semibold text-ink">No section data yet</p>
                <p className="mt-1 text-xs text-ink-light">Add students with sections from the Student Directory to populate this view.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
