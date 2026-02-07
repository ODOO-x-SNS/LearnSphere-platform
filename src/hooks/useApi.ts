import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, coursesApi, lessonsApi, quizzesApi, reportsApi, auditApi } from '../services/api';
import { useAuthStore } from '../store/auth';
import type { Course, Lesson, Quiz } from '../types';

// ── Auth ──
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me();
      setUser(res.data);
      return res.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const { setAccessToken, setUser } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    },
  });
}

// ── Courses ──
export function useCourses(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.list(params).then((r) => r.data),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; tags?: string[] }) =>
      coursesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Course>) => coursesApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useTogglePublish(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shouldPublish: boolean) =>
      shouldPublish
        ? coursesApi.publish(id).then((r) => r.data)
        : coursesApi.unpublish(id).then((r) => r.data),
    onMutate: async (shouldPublish) => {
      await qc.cancelQueries({ queryKey: ['course', id] });
      const previous = qc.getQueryData(['course', id]);
      qc.setQueryData(['course', id], (old: Course | undefined) =>
        old ? { ...old, published: shouldPublish } : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['course', id], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useInviteToCourse(courseId: string) {
  return useMutation({
    mutationFn: (emails: string[]) => coursesApi.invite(courseId, emails),
  });
}

export function useCourseReviews(courseId: string) {
  return useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => coursesApi.reviews(courseId).then((r) => r.data),
    enabled: !!courseId,
  });
}

// ── Lessons ──
export function useCreateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lesson>) => lessonsApi.create(courseId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) =>
      lessonsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

// ── Quizzes ──
export function useCreateQuiz(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Quiz>) => quizzesApi.create(courseId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateQuiz(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quiz> }) =>
      quizzesApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useDeleteQuiz(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizzesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

// ── Reports ──
export function useCourseProgress(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'course-progress', params],
    queryFn: () => reportsApi.courseProgress(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

// ── Audit ──
export function useAuditLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.logs(params).then((r) => r.data),
  });
}
