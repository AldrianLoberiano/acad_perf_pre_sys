"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
      if (isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot connect to backend API. Start backend on http://127.0.0.1:5000.");
          return;
        }

        if (err.response.status === 401) {
          setError("Invalid username or password.");
          return;
        }

        const apiMessage = (err.response.data as { message?: string } | undefined)?.message;
        setError(apiMessage || "Login failed. Verify credentials or seed users first.");
        return;
      }

      setError("Login failed. Verify credentials or seed users first.");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="fade-in w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Academic Signal Studio
          </h1>
          <p className="mt-1 text-sm text-ink-light">
            Sign in to manage students and predictions
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Username
              </label>
              <Input
                {...form.register("username")}
                placeholder="Enter your username"
              />
              {form.formState.errors.username && (
                <p className="mt-1 text-xs text-danger">
                  Username must be at least 3 characters
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <Input
                {...form.register("password")}
                type="password"
                placeholder="Enter your password"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-danger">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-danger">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-ink-light">
          Academic Performance Prediction System
        </p>
      </div>
    </div>
  );
}
