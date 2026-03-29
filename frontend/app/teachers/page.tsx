"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import type { Student } from "@/types/api";

type TeacherSummary = {
  name: string;
  studentCount: number;
  sections: string[];
  courses: string[];
};

type TeacherAssignment = {
  teacher: string;
  section: string;
  course: string;
  studentCount: number;
};

type AddTeacherForm = {
  name: string;
  section: string;
  course: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function buildTeacherSummary(students: Student[]): TeacherSummary[] {
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

function escapeCsv(value: string | number): string {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function TeachersPage() {
  const token = useAuthGuard();
  const queryClient = useQueryClient();
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [addForm, setAddForm] = useState<AddTeacherForm>({
    name: "",
    section: "",
    course: ""
  });
  const [formError, setFormError] = useState<string | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students", token, "teachers-page"],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const students = studentsQuery.data ?? [];
  const teacherRows = useMemo(() => buildTeacherSummary(students), [students]);

  const assignTeacherMutation = useMutation({
    mutationFn: async (form: AddTeacherForm) => {
      const sectionKey = normalize(form.section);
      const courseKey = normalize(form.course);

      const matchingStudents = students.filter((student) => {
        const section = normalize(student.section || "");
        const course = normalize(student.course);
        return section === sectionKey && course === courseKey;
      });

      if (matchingStudents.length === 0) {
        throw new Error("No students found for the selected section and course.");
      }

      await Promise.all(
        matchingStudents.map((student) =>
          studentsApi.update(token as string, student.id, { teacher: form.name.trim() })
        )
      );

      return matchingStudents.length;
    },
    onSuccess: () => {
      setShowAddTeacher(false);
      setAddForm({ name: "", section: "", course: "" });
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["students", token] });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Failed to add teacher.");
    }
  });

  const exportRows: TeacherAssignment[] = useMemo(() => {
    const rows: TeacherAssignment[] = [];
    for (const teacher of teacherRows) {
      for (const section of teacher.sections.length ? teacher.sections : ["Unassigned"]) {
        for (const course of teacher.courses) {
          rows.push({
            teacher: teacher.name,
            section,
            course,
            studentCount: teacher.studentCount
          });
        }
      }
    }
    return rows;
  }, [teacherRows]);

  function exportCsv(): void {
    const rows = exportRows;
    const header = ["Teacher", "Section", "Course", "Students"];
    const lines = [
      header.join(","),
      ...rows.map((row) => [
        escapeCsv(row.teacher),
        escapeCsv(row.section),
        escapeCsv(row.course),
        escapeCsv(row.studentCount)
      ].join(","))
    ];

    downloadBlob(lines.join("\n"), "teachers-sections-courses.csv", "text/csv;charset=utf-8");
  }

  function exportExcel(): void {
    const rows = exportRows;
    const htmlRows = rows
      .map((row) => `<tr><td>${row.teacher}</td><td>${row.section}</td><td>${row.course}</td><td>${row.studentCount}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr><th>Teacher</th><th>Section</th><th>Course</th><th>Students</th></tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body>
      </html>
    `;

    downloadBlob(html, "teachers-sections-courses.xls", "application/vnd.ms-excel;charset=utf-8");
  }

  function exportPdf(): void {
    const rows = exportRows;
    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) {
      return;
    }

    const tableRows = rows
      .map((row) => `<tr><td>${row.teacher}</td><td>${row.section}</td><td>${row.course}</td><td>${row.studentCount}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>Teachers Sections Courses</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Teachers, Sections and Courses</h1>
          <table>
            <thead>
              <tr><th>Teacher</th><th>Section</th><th>Course</th><th>Students</th></tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Faculty Management</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Teacher Directory</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-light">
              Overview of all teachers, their assigned sections, and course coverage.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowAddTeacher(true);
                setFormError(null);
              }}
              className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
            >
              Add Teacher
            </button>
            <button
              onClick={exportCsv}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-hover transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={exportExcel}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-hover transition-colors"
            >
              Export Excel
            </button>
            <button
              onClick={exportPdf}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-hover transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Total Teachers</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{teacherRows.length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Assigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{students.length}</p>
          </Card>
          <Card className="shadow-none">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Unassigned Students</p>
            <p className="mt-2 text-3xl font-extrabold text-danger">
              {students.filter((student) => !student.teacher || !student.teacher.trim()).length}
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

            {filteredTeacherRows.map((teacher) => (
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
                  <p className="text-sm text-ink-light">{teacher.sections.length ? teacher.sections.join(", ") : "Unassigned"}</p>
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

        {showAddTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setShowAddTeacher(false)}
              className="absolute inset-0 bg-navy/45"
              aria-label="Close add teacher dialog"
            />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-paper p-5 shadow-2xl">
              <h4 className="text-lg font-bold text-ink">Add Teacher</h4>
              <p className="mt-1 text-xs text-ink-light">
                Assign a teacher to all students in the selected section and course.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-ink-light">Teacher Name</label>
                  <input
                    value={addForm.name}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                    placeholder="Dr. Nadia Clark"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-ink-light">Section</label>
                  <input
                    value={addForm.section}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, section: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                    placeholder="A"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-ink-light">Course</label>
                  <input
                    value={addForm.course}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, course: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              {formError && <p className="mt-3 text-xs font-semibold text-danger">{formError}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!addForm.name.trim() || !addForm.section.trim() || !addForm.course.trim()) {
                      setFormError("Teacher name, section, and course are required.");
                      return;
                    }
                    setFormError(null);
                    assignTeacherMutation.mutate(addForm);
                  }}
                  disabled={assignTeacherMutation.isPending}
                  className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assignTeacherMutation.isPending ? "Saving..." : "Save Teacher"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
