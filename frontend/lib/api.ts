import axios from "axios";

import type {
  AnalyticsOverview,
  LoginResponse,
  Performance,
  Prediction,
  Student,
  UserRole
} from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const authApi = {
  register: async (payload: { username: string; password: string; role: UserRole }) => {
    return api.post("/auth/register", payload);
  },
  login: async (payload: { username: string; password: string }) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  }
};

export const studentsApi = {
  list: async (token: string) => {
    const { data } = await api.get<{ data: Student[] }>("/students", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
  },
  create: async (token: string, payload: Omit<Student, "id">) => {
    const { data } = await api.post<{ student: Student }>("/students", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.student;
  }
};

export const performanceApi = {
  add: async (token: string, payload: Omit<Performance, "id" | "created_at">) => {
    const { data } = await api.post<{ performance: Performance }>("/performance", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.performance;
  }
};

export const predictionApi = {
  predict: async (token: string, studentId: number) => {
    const { data } = await api.post<Prediction>(`/predict/${studentId}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  list: async (token: string) => {
    const { data } = await api.get<{ data: Prediction[] }>("/predictions", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
  }
};

export const analyticsApi = {
  overview: async (token: string) => {
    const { data } = await api.get<AnalyticsOverview>("/analytics/overview", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  atRisk: async (token: string) => {
    const { data } = await api.get<{ data: Array<{ name: string; risk_level: string; failure_probability: number }> }>("/analytics/at-risk", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
  }
};
