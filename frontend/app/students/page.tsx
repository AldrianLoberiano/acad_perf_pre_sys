"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AppShell } from "@/components/layout/app-shell";
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

  return (
    <AppShell>
      <div className="space-y-4 fade-in">
        <h2 className="font-display text-2xl font-bold">Students</h2>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Create Student</h3>
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={form.handleSubmit((v) => createMutation.mutate({ ...v, age: Number(v.age) }))}
          >
            <Input placeholder="Name" {...form.register("name", { required: true })} />
            <Input placeholder="Age" type="number" {...form.register("age", { required: true, valueAsNumber: true })} />
            <Input placeholder="Course" {...form.register("course", { required: true })} />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Create"}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Student List</h3>
          <div className="space-y-2">
            {(studentsQuery.data ?? []).map((student) => (
              <div key={student.id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2">
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-ink/60">{student.course} • Age {student.age}</p>
                </div>
                <span className="rounded-full bg-accentSoft px-2 py-1 text-xs">ID {student.id}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
