"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "teacher_seed",
      password: "TeacherPass123!"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const data = await authApi.login(values);
      setAuth(data.access_token, data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError("Login failed. Verify credentials or seed users first.");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="fade-in w-full max-w-md border border-ink/10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-ink">Academic Signal Studio</h1>
          <p className="mt-1 text-sm text-ink/70">Sign in to manage students and predictions.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold">Username</label>
            <Input {...form.register("username")} placeholder="teacher_seed" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Password</label>
            <Input {...form.register("password")} type="password" placeholder="TeacherPass123!" />
          </div>

          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
