import { api } from "../lib/api";
import type {
  Course,
  Lesson,
  Quiz,
  User,
  PaginatedResponse,
  ReportRow,
  ReportSummary,
  LearnerDetail,
  CourseRequest,
  Review,
  UploadInitResponse,
  FileMetadata,
} from "../types";

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: User }>("/auth/login", {
      email,
      password,
    }),
  me: () => api.get<User>("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", {
      email,
      appType: "admin",
    }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    }),
};

// Users
export const usersApi = {
  updateProfile: (data: { name?: string; bio?: string; avatarUrl?: string }) =>
    api.patch<User>("/users/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<{ message: string }>("/users/me/password", data),
};

// Instructors
export const instructorsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<User>>("/users/instructors", { params }),
  get: (id: string) =>
    api.get<
      User & {
        coursesCount: number;
        studentCount: number;
        courses: Array<{
          id: string;
          title: string;
          published: boolean;
          createdAt: string;
        }>;
      }
    >(`/users/instructors/${id}`),
};

// Courses
export const coursesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Course>>("/courses", { params }),
  listBackoffice: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Course>>("/courses/backoffice", { params }),
  get: (id: string) => api.get<Course>(`/courses/${id}`),
  create: (data: { title: string; description?: string; tags?: string[] }) =>
    api.post<Course>("/courses", data),
  update: (id: string, data: Partial<Course>) =>
    api.patch<Course>(`/courses/${id}`, data),
  publish: (id: string) => api.post<Course>(`/courses/${id}/publish`),
  unpublish: (id: string) => api.post<Course>(`/courses/${id}/unpublish`),
  delete: (id: string) => api.delete(`/courses/${id}`),
  invite: (id: string, emails: string[]) =>
    api.post(`/courses/${id}/invite`, { emails }),
  reviews: (id: string) => api.get<Review[]>(`/courses/${id}/reviews`),
};

// Lessons
export const lessonsApi = {
  create: (courseId: string, data: Partial<Lesson>) =>
    api.post<Lesson>(`/courses/${courseId}/lessons`, data),
  list: (courseId: string) => api.get<Lesson[]>(`/courses/${courseId}/lessons`),
  update: (id: string, data: Partial<Lesson>) =>
    api.patch<Lesson>(`/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
  reorder: (
    courseId: string,
    lessons: Array<{ id: string; sortOrder: number }>,
  ) => api.put(`/courses/${courseId}/lessons/reorder`, { lessons }),
};

// Quizzes
export const quizzesApi = {
  create: (courseId: string, data: Partial<Quiz>) =>
    api.post<Quiz>(`/courses/${courseId}/quizzes`, data),
  get: (id: string) => api.get<Quiz>(`/quizzes/${id}`),
  update: (id: string, data: Partial<Quiz>) =>
    api.patch<Quiz>(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
};

// Uploads
export const uploadsApi = {
  init: (file: { filename: string; mimeType: string; size: number }) =>
    api.post<UploadInitResponse>("/uploads/init", file),
  complete: (fileId: string) =>
    api.post<{ file: FileMetadata }>("/uploads/complete", { fileId }),
};

// Reports
export const reportsApi = {
  courseProgress: (params?: Record<string, unknown>) =>
    api.get<{
      summary: ReportSummary;
      rows: ReportRow[];
    }>("/reports/course-progress", { params }),
  learners: (params?: Record<string, unknown>) =>
    api.get<LearnerDetail[]>("/reports/learners", { params }),
  reviews: () =>
    api.get<Review[]>("/reports/reviews"),
  dashboardStats: () =>
    api.get<{
      totalCourses: number;
      totalEnrolled: number;
      completionRate: number;
      avgQuizScore: number;
    }>("/reports/dashboard"),
};

// Course Requests
export const courseRequestsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<CourseRequest>>("/course-requests", { params }),
  get: (id: string) => api.get<CourseRequest>(`/course-requests/${id}`),
  submit: (courseId: string) =>
    api.post<CourseRequest>("/course-requests", { courseId }),
  approve: (id: string) =>
    api.patch<CourseRequest>(`/course-requests/${id}/approve`, {}),
  reject: (id: string, reason: string) =>
    api.patch<CourseRequest>(`/course-requests/${id}/reject`, { reason }),
  stats: () =>
    api.get<{
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    }>("/course-requests/stats"),
};

// Health
export const healthApi = {
  check: () => api.get("/health"),
};

// Instructor Requests (admin approval)
export const instructorRequestsApi = {
  list: () =>
    api.get<
      Array<{
        id: string;
        name: string;
        email: string;
        status: string;
        createdAt: string;
      }>
    >("/admin/instructor-requests"),
  approve: (id: string) =>
    api.post<{ message: string }>(`/admin/approve-instructor/${id}`),
  reject: (id: string) =>
    api.post<{ message: string }>(`/admin/reject-instructor/${id}`),
};
