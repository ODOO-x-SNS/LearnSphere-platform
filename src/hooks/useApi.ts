import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  coursesApi,
  lessonsApi,
  quizzesApi,
  reportsApi,
  usersApi,
  instructorsApi,
  courseRequestsApi,
  instructorRequestsApi,
} from "../services/api";
import { useAuthStore } from "../store/auth";
import type { Course, Lesson, Quiz } from "../types";

// ── Auth ──
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
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

// ── Users ──
export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: { name?: string; bio?: string; avatarUrl?: string }) =>
      usersApi.updateProfile(data).then((r) => r.data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(data).then((r) => r.data),
  });
}

// ── Instructors ──
export function useInstructors(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["instructors", params],
    queryFn: () => instructorsApi.list(params).then((r) => r.data),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useInstructorDetails(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["instructor", id],
    queryFn: () => instructorsApi.get(id).then((r) => r.data),
    enabled: !!id && enabled,
  });
}

// ── Courses ──
export function useCourses(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => coursesApi.listBackoffice(params).then((r) => r.data),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      coverImageId: string;
      description?: string;
      tags?: string[];
    }) => coursesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Course>) =>
      coursesApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", id] });
      qc.invalidateQueries({ queryKey: ["courses"] });
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
      await qc.cancelQueries({ queryKey: ["course", id] });
      const previous = qc.getQueryData(["course", id]);
      qc.setQueryData(["course", id], (old: Course | undefined) =>
        old ? { ...old, published: shouldPublish } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(["course", id], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["course", id] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
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
    queryKey: ["reviews", courseId],
    queryFn: () => coursesApi.reviews(courseId).then((r) => r.data),
    enabled: !!courseId,
  });
}

// ── Lessons ──
export function useCreateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lesson>) =>
      lessonsApi.create(courseId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) =>
      lessonsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useReorderLessons(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessons: Array<{ id: string; sortOrder: number }>) =>
      lessonsApi.reorder(courseId, lessons),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

// ── Quizzes ──
export function useCreateQuiz(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Quiz>) =>
      quizzesApi.create(courseId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
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
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useDeleteQuiz(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizzesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

// ── Reports ──
export function useCourseProgress(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["reports", "course-progress", params],
    queryFn: () => reportsApi.courseProgress(params).then((r) => r.data),
    staleTime: 30_000,
    enabled: !!params?.courseId,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => reportsApi.dashboardStats().then((r) => r.data),
    staleTime: 30_000,
  });
}

// ── Course Requests ──
export function useCourseRequests(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["course-requests", params],
    queryFn: () => courseRequestsApi.list(params).then((r) => r.data),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useCourseRequest(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["course-request", id],
    queryFn: () => courseRequestsApi.get(id).then((r) => r.data),
    enabled: !!id && enabled,
  });
}

export function useCourseRequestStats() {
  return useQuery({
    queryKey: ["course-requests", "stats"],
    queryFn: () => courseRequestsApi.stats().then((r) => r.data),
    staleTime: 15_000,
  });
}

export function useSubmitCourseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      courseRequestsApi.submit(courseId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-requests"] });
      qc.invalidateQueries({ queryKey: ["course-requests", "stats"] });
    },
  });
}

export function useApproveCourseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      courseRequestsApi.approve(id).then((r) => r.data),
    onSuccess: () => {
      // Invalidate all course-requests queries regardless of filters
      qc.invalidateQueries({
        queryKey: ["course-requests"],
        exact: false,
      });
      // Invalidate stats specifically
      qc.invalidateQueries({
        queryKey: ["course-requests", "stats"],
        exact: true,
      });
    },
  });
}

export function useRejectCourseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      courseRequestsApi.reject(id, reason).then((r) => r.data),
    onSuccess: () => {
      // Invalidate all course-requests queries regardless of filters
      qc.invalidateQueries({
        queryKey: ["course-requests"],
        exact: false,
      });
      // Invalidate stats specifically
      qc.invalidateQueries({
        queryKey: ["course-requests", "stats"],
        exact: true,
      });
    },
  });
}

// ── Instructor Signup Requests ──
export function useInstructorRequests() {
  return useQuery({
    queryKey: ["instructor-requests"],
    queryFn: () => instructorRequestsApi.list().then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useApproveInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      instructorRequestsApi.approve(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-requests"] });
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}

export function useRejectInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      instructorRequestsApi.reject(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-requests"] });
    },
  });
}
