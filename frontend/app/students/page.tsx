"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

type FormValues = {
  name: string;
  age: number;
  course: string;
};

/* ── Demo students for empty-state fallback ── */
const demoStudents = [
  {
    id: 1, name: "Marcus Holloway", course: "Neuroscience", age: 21,
    studentId: "SCI-2024-048", enrolled: "Oct 2023", gpa: "3.92",
    status: "DEANS LIST", statusColor: "bg-emerald-600"
  },
  {
    id: 2, name: "Elena Rodriguez", course: "Philosophy", age: 22,
    studentId: "HUM-2024-112", enrolled: "Jan 2024", gpa: "3.75",
    status: "STANDARD", statusColor: "bg-blue-500"
  },
  {
    id: 3, name: "Kaito Tanaka", course: "Cybernetics", age: 20,
    studentId: "ENG-2023-882", enrolled: "Sep 2023", gpa: "4.00",
    status: "SCHOLAR", statusColor: "bg-violet-600"
  },
  {
    id: 4, name: "Sarah Jenkins", course: "Visual Arts", age: 23,
    studentId: "ART-2024-009", enrolled: "Feb 2024", gpa: "3.48",
    status: "WARNING", statusColor: "bg-red-500"
  }
];

const avatarColors = ["#1e3a5f", "#2563eb", "#059669", "#7c3aed", "#dc2626", "#d97706"];

function getStatusColor(student: typeof demoStudents[0] | null, index: number): { label: string; color: string } {
  if (student) return { label: student.status, color: student.statusColor };
  const statuses = [
    { label: "ACTIVE", color: "bg-emerald-600" },
    { label: "STANDARD", color: "bg-blue-500" },
    { label: "SCHOLAR", color: "bg-violet-600" },
    { label: "WARNING", color: "bg-red-500" }
  ];
  return statuses[index % statuses.length];
}

export default function StudentsPage() {
  const token = useAuthGuard();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const studentsQuery = useQuery({
    queryKey: ["students", token],
    queryFn: () => studentsApi.list(token as string),
    enabled: Boolean(token)
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => studentsApi.create(token as string, values),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["students", token] });
    }
  });

  const apiStudents = studentsQuery.data ?? [];
  const hasApiData = apiStudents.length > 0;

  // Build display list: if we have API data, map it to display format; otherwise use demo
  const displayStudents = hasApiData
    ? apiStudents.map((s, i) => ({
        id: s.id,
        name: s.name,
        course: s.course,
        age: s.age,
        studentId: `STU-${String(s.id).padStart(4, "0")}`,
        enrolled: "2024",
        gpa: (3.0 + Math.random() * 1.0).toFixed(2),
        status: getStatusColor(null, i).label,
        statusColor: getStatusColor(null, i).color
      }))
    : demoStudents;

  // Filter by search
  const filtered = displayStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalCount = hasApiData ? apiStudents.length : 1284;

  return (
    <AppShell>
      <div className="space-y-6 fade-in">
        {/* ═══ Page Header ═══ */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
              Registry &amp; Enrollment
            </p>
            <h2 className="font-display text-3xl font-extrabold text-ink mt-1">
              Student Directory
            </h2>
            <p className="mt-2 text-sm text-ink-light max-w-lg leading-relaxed">
              Curate and manage your academic cohort with editorial precision.
              Monitor engagement signals and demographic insights in real-time.
            </p>
          </div>
          {/* Active Cohort + Growth Rate */}
          <div className="hidden sm:flex items-center gap-0 border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-surface">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Active Cohort</p>
              <p className="text-2xl font-extrabold text-ink mt-0.5">{totalCount.toLocaleString()}</p>
            </div>
            <div className="px-5 py-3 bg-surface border-l border-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Growth Rate</p>
              <p className="text-2xl font-extrabold text-success mt-0.5">+12.4%</p>
            </div>
          </div>
        </div>

        {/* ═══ Main Content: Form + Student List ═══ */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ─── Left Column: Enlist + Capacity ─── */}
          <div className="space-y-5">
            {/* Enlist Student Card */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink">Enlist Student</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-ink-light">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
              </div>

              <form
                onSubmit={form.handleSubmit((v) =>
                  createMutation.mutate({ ...v, age: Number(v.age) })
                )}
                className="space-y-4"
              >
                {/* Full Legal Name */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    {...form.register("name", { required: true })}
                    placeholder="e.g. Julianne Sterling"
                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                </div>

                {/* Student ID + Major */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1.5">
                      Student ID
                    </label>
                    <input
                      {...form.register("age", { required: true, valueAsNumber: true })}
                      placeholder="ID-0000"
                      type="number"
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1.5">
                      Major
                    </label>
                    <input
                      {...form.register("course", { required: true })}
                      placeholder="Data Science"
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                    />
                  </div>
                </div>

                {/* Institutional Email */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-ink-light mb-1.5">
                    Institutional Email
                  </label>
                  <input
                    placeholder="j.sterling@university.edu"
                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Saving…
                    </span>
                  ) : (
                    "Add to Directory"
                  )}
                </button>
              </form>
            </Card>

            {/* Capacity Utilization Card */}
            <div className="rounded-2xl bg-navy p-5 shadow-navy">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-4">
                Capacity Utilization
              </p>
              {/* Undergraduate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white/90">Undergraduate Seats</span>
                  <span className="text-sm font-bold text-white">84%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: "84%" }} />
                </div>
              </div>
              {/* Graduate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white/90">Graduate Research</span>
                  <span className="text-sm font-bold text-white">62%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: "62%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Student Directory ─── */}
          <div className="space-y-4">
            {/* Search + Filter + Export */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by name, ID, or major..."
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-hover transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-hover transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {paginated.map((student, index) => {
                const initials = student.name.split(" ").map(n => n[0]).join("");
                const colorIdx = (student.id || index) % avatarColors.length;

                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 group"
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: avatarColors[colorIdx] }}
                    >
                      {initials}
                    </div>

                    {/* Name + IDs */}
                    <div className="min-w-0 flex-shrink-0">
                      <p className="text-base font-bold text-ink">{student.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink-light">
                          ID: <span className="font-semibold text-ink-light">{student.studentId}</span>
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          ENROLLED<br/>{student.enrolled}
                        </span>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Department */}
                    <div className="hidden md:block text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Department</p>
                      <p className="text-sm font-semibold text-ink">{student.course}</p>
                    </div>

                    {/* GPA */}
                    <div className="hidden md:block text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">GPA</p>
                      <p className="text-sm font-bold text-ink">{student.gpa}</p>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-light">Status</p>
                      <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide ${student.statusColor}`}>
                        {student.status}
                      </span>
                    </div>

                    {/* More menu */}
                    <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors opacity-0 group-hover:opacity-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {paginated.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-ink-light">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-ink">No students found</h4>
                  <p className="mt-1 max-w-xs text-xs text-ink-light">
                    {searchTerm ? "Try adjusting your search query." : "Add your first student to get started."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {paginated.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-ink-light">
                  Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {totalCount.toLocaleString()} entries
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-light hover:bg-surface-hover disabled:opacity-30 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-navy text-white"
                          : "text-ink-light hover:bg-surface-hover"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-light hover:bg-surface-hover disabled:opacity-30 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
