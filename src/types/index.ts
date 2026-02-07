// Types for LearnSphere Admin Platform

export type Role = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  totalPoints: number;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  tags: string[];
  lessonsCount: number;
  totalDurationSec: number;
  published: boolean;
  visibility: 'EVERYONE' | 'SIGNED_IN';
  accessRule: 'OPEN' | 'INVITATION' | 'PAYMENT';
  price?: number;
  websiteUrl?: string;
  responsibleId?: string;
  coverImageId?: string;
  coverImageUrl?: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'VIDEO' | 'DOCUMENT' | 'IMAGE' | 'QUIZ';
  externalUrl?: string;
  durationSec: number;
  allowDownload: boolean;
  description?: string;
  sortOrder: number;
  mediaFileId?: string;
  mediaFileUrl?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  pointsFirstTry: number;
  pointsSecondTry?: number;
  questions: Question[];
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  multipleSelection: boolean;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface UploadInitResponse {
  uploadUrl: string;
  fileId: string;
  method: string;
}

export interface FileMetadata {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Invitation {
  id: string;
  email: string;
  courseId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
}

export interface ReportRow {
  userId: string;
  userName: string;
  email: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  quizScore?: number;
  lastActivity: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ReportSummary {
  totalEnrolled: number;
  completionRate: number;
  avgProgress: number;
  avgQuizScore: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Paging {
  nextCursor?: string;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging: Paging;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
