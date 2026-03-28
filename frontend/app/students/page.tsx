"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { studentsApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";

type FormValues = {
  name: string;
  age: number;
  course: string;
};

export default function StudentsPage() {
  const token = useAuthGuard();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>();

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

  const students = studentsQuery.data ?? [];

  return (
    <AppShell>
      <div className="space-y-6 fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Students</h2>
            <p className="mt-1 text-sm text-ink-light">
              Manage student records and enrollment
            </p>
          </div>
          <Badge variant="accent">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Create form */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Add New Student</h3>
              <p className="text-xs text-ink-light">Fill in the details to create a record</p>
            </div>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={form.handleSubmit((v) => createMutation.mutate({ ...v, age: Number(v.age) }))}
          >
            <Input placeholder="Full name" {...form.register("name", { required: true })} />
            <Input placeholder="Age" type="number" {...form.register("age", { required: true, valueAsNumber: true })} />
            <Input placeholder="Course" {...form.register("course", { required: true })} />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Saving…
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Student list */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-ink">Student Directory</h3>
            <p className="text-xs text-ink-light">All enrolled students in the system</p>
          </div>

          {students.length === 0 && !studentsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover text-ink-light">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-ink">No students yet</h4>
              <p className="mt-1 max-w-xs text-xs text-ink-light">
                Add your first student using the form above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors duration-150 hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                      {student.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{student.name}</p>
                      <p className="text-xs text-ink-light">{student.course} • Age {student.age}</p>
                    </div>
                  </div>
                  <Badge>ID {student.id}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
