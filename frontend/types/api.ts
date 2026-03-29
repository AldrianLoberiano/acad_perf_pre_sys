export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Student {
  id: number;
  name: string;
  age: number;
  course: string;
  section?: string | null;
  teacher?: string | null;
}

export interface Performance {
  id: number;
  student_id: number;
  attendance: number;
  quiz_score: number;
  assignment_score: number;
  study_hours: number;
  created_at: string;
}

export interface Prediction {
  id?: number;
  student_id: number;
  predicted_grade: string;
  risk_level: "Low" | "Medium" | "High";
  confidence: number;
  failure_probability: number;
  recommendations: string[];
  created_at?: string;
}

export interface AnalyticsOverview {
  class_average: number;
  top_performers: Array<{
    student_id: number;
    name: string;
    avg_score: number;
  }>;
  pass_fail_ratio: {
    pass: number;
    fail: number;
  };
  performance_trends: Array<{
    date: string;
    avg_failure_probability: number;
  }>;
}
