import { api } from '../lib/api';
import type {
  Course, Lesson, Quiz, User, PaginatedResponse,
  ReportRow, ReportSummary, AuditLog, Review,
  UploadInitResponse, FileMetadata,
} from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Users
export const usersApi = {
  updateProfile: (data: { name?: string; bio?: string; avatarUrl?: string }) =>
    api.patch<User>('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<{ message: string }>('/users/me/password', data),
};

// Courses
export const coursesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Course>>('/courses', { params }),
  listBackoffice: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Course>>('/courses/backoffice', { params }),
  get: (id: string) => api.get<Course>(`/courses/${id}`),
  create: (data: { title: string; description?: string; tags?: string[] }) =>
    api.post<Course>('/courses', data),
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
  update: (id: string, data: Partial<Lesson>) =>
    api.patch<Lesson>(`/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
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
    api.post<UploadInitResponse>('/uploads/init', file),
  complete: (fileId: string) =>
    api.post<{ file: FileMetadata }>('/uploads/complete', { fileId }),
};

// Reports
export const reportsApi = {
  courseProgress: (params?: Record<string, unknown>) =>
    api.get<{ summary: ReportSummary; rows: ReportRow[]; paging: { nextCursor?: string; limit: number } }>(
      '/reports/course-progress', { params }
    ),
  dashboardStats: () =>
    api.get<{ totalCourses: number; totalEnrolled: number; completionRate: number; avgQuizScore: number }>(
      '/reports/dashboard'
    ),
};

// Audit
export const auditApi = {
  logs: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params }),
};

// Health
export const healthApi = {
  check: () => api.get('/health'),
};
