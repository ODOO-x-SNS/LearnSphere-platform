# API Reference

> Complete backend API endpoint contracts used by the LearnSphere Admin frontend. All endpoints are proxied through Vite — the frontend calls `/api/v1/...` and Vite forwards to `http://localhost:3000/api/v1/...`.

---

## Base Configuration

```ts
// src/lib/api.ts
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,   // Sends cookies (used for refresh token)
});
```

**Authentication:** All authenticated endpoints require `Authorization: Bearer <accessToken>` header (automatically attached by the Axios request interceptor).

**Error Shape:** All errors follow this structure:

```ts
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

**Pagination:** Uses cursor-based pagination:

```ts
interface Paging {
  nextCursor?: string;  // undefined = no more pages
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  paging: Paging;
}
```

---

## Authentication

### POST `/auth/login`

Login with email and password.

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Response** `200`:
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "totalPoints": 0,
    "avatarUrl": null
  }
}
```

**Frontend hook:** `useLogin()`

---

### GET `/auth/me`

Get the currently authenticated user.

**Response** `200`:
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "ADMIN",
  "totalPoints": 150,
  "avatarUrl": "https://..."
}
```

**Frontend hook:** `useMe()`

---

### POST `/auth/refresh`

Refresh the access token using an HTTP-only refresh cookie.

**Request:** No body required. The refresh token is sent via cookies (`withCredentials: true`).

**Response** `200`:
```json
{
  "accessToken": "eyJ..."
}
```

**Used by:** Axios 401 response interceptor (automatic).

---

## Courses

### GET `/courses`

List courses with optional filtering and pagination.

| Query Param  | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| `published`  | boolean | Filter by published status          |
| `search`     | string | Search by title                      |
| `limit`      | number | Items per page (default: 20)         |
| `cursor`     | string | Pagination cursor                    |

**Response** `200`: `PaginatedResponse<Course>`

**Frontend hook:** `useCourses(params?)`

---

### GET `/courses/:id`

Get a single course with its lessons and quizzes.

**Response** `200`: `Course` (includes `lessons[]` and `quizzes[]`)

**Frontend hook:** `useCourse(id)`

---

### POST `/courses`

Create a new course.

| Field         | Type     | Required |
| ------------- | -------- | -------- |
| `title`       | string   | Yes      |
| `description` | string   | No       |
| `tags`        | string[] | No       |

**Response** `201`: `Course`

**Frontend hook:** `useCreateCourse()`

---

### PATCH `/courses/:id`

Update a course. Accepts partial updates.

| Field           | Type     | Description                           |
| --------------- | -------- | ------------------------------------- |
| `title`         | string   | Course title                          |
| `description`   | string   | Course description                    |
| `tags`          | string[] | Course tags                           |
| `visibility`    | string   | `EVERYONE`, `ENROLLED`, `INVITATION`  |
| `accessRule`    | string   | `FREE`, `PAYMENT`, `INVITATION`       |
| `price`         | number   | Required when accessRule is `PAYMENT` |
| `websiteUrl`    | string   | External course URL                   |
| `coverImageId`  | string   | File ID from upload flow              |

**Response** `200`: `Course`

**Frontend hook:** `useUpdateCourse(id)`

---

### POST `/courses/:id/publish`

Publish a course (make it live).

**Response** `200`: `Course`

**Frontend hook:** `useTogglePublish(id)` — calls publish when `shouldPublish=true`

---

### POST `/courses/:id/unpublish`

Unpublish a course (revert to draft).

**Response** `200`: `Course`

**Frontend hook:** `useTogglePublish(id)` — calls unpublish when `shouldPublish=false`

---

### DELETE `/courses/:id`

Delete a course and all its associated lessons and quizzes.

**Response** `204`

**Frontend hook:** `useDeleteCourse()`

---

### POST `/courses/:id/invite`

Send course invitations to email addresses.

| Field    | Type     | Required |
| -------- | -------- | -------- |
| `emails` | string[] | Yes      |

**Response** `200`: `Invitation[]`

**Frontend hook:** `useInviteToCourse(courseId)`

---

### GET `/courses/:id/reviews`

Get reviews for a specific course.

**Response** `200`: `Review[]`

```ts
interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;        // 1–5
  text: string;
  createdAt: string;     // ISO 8601
}
```

**Frontend hook:** `useCourseReviews(courseId)`

---

## Lessons

### POST `/courses/:courseId/lessons`

Create a lesson within a course.

| Field           | Type    | Required | Description                        |
| --------------- | ------- | -------- | ---------------------------------- |
| `title`         | string  | Yes      | Lesson title                       |
| `type`          | string  | Yes      | `VIDEO`, `DOCUMENT`, `IMAGE`, `QUIZ` |
| `externalUrl`   | string  | No       | External URL (for VIDEO type)      |
| `durationSec`   | number  | No       | Duration in seconds                |
| `allowDownload` | boolean | No       | Allow learners to download content |
| `description`   | string  | No       | Lesson description                 |
| `sortOrder`     | number  | No       | Display order                      |

**Response** `201`: `Lesson`

**Frontend hook:** `useCreateLesson(courseId)`

---

### PATCH `/lessons/:id`

Update a lesson.

**Body:** Partial `Lesson` fields.

**Response** `200`: `Lesson`

**Frontend hook:** `useUpdateLesson(courseId)`

---

### DELETE `/lessons/:id`

Delete a lesson.

**Response** `204`

**Frontend hook:** `useDeleteLesson(courseId)`

---

## Quizzes

### POST `/courses/:courseId/quizzes`

Create a quiz with questions and options.

| Field              | Type       | Required | Description               |
| ------------------ | ---------- | -------- | ------------------------- |
| `title`            | string     | Yes      | Quiz title                |
| `pointsFirstTry`   | number     | Yes      | Points for first attempt  |
| `pointsSecondTry`  | number     | No       | Points for second attempt |
| `questions`         | Question[] | Yes      | Array of questions        |

**Question shape:**
```ts
{
  text: string;
  multipleSelection: boolean;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}
```

**Response** `201`: `Quiz`

**Frontend hook:** `useCreateQuiz(courseId)`

---

### GET `/quizzes/:id`

Get a single quiz with all questions and options.

**Response** `200`: `Quiz`

**Frontend hook:** `useQuiz(id)`

---

### PATCH `/quizzes/:id`

Update a quiz (partial).

**Response** `200`: `Quiz`

**Frontend hook:** `useUpdateQuiz(courseId)`

---

### DELETE `/quizzes/:id`

Delete a quiz.

**Response** `204`

**Frontend hook:** `useDeleteQuiz(courseId)`

---

## Uploads

### POST `/uploads/init`

Initialize a file upload and get a presigned URL.

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `filename` | string | Yes      |
| `mimeType` | string | Yes      |
| `size`     | number | Yes      |

**Response** `200`:
```json
{
  "uploadUrl": "https://storage.example.com/presigned-url...",
  "fileId": "uuid",
  "method": "PUT"
}
```

---

### PUT `<uploadUrl>` (External)

Upload file content directly to the presigned URL. This is **not** routed through the backend API.

**Headers:** `Content-Type: <mimeType>`
**Body:** Raw file binary

---

### POST `/uploads/complete`

Mark an upload as complete and get file metadata.

| Field    | Type   | Required |
| -------- | ------ | -------- |
| `fileId` | string | Yes      |

**Response** `200`:
```json
{
  "file": {
    "id": "uuid",
    "url": "https://cdn.example.com/files/...",
    "filename": "cover.jpg",
    "mimeType": "image/jpeg",
    "size": 204800
  }
}
```

**Frontend helper:** `uploadFile(file, onProgress?)` in `src/lib/upload.ts`

---

## Reports

### GET `/reports/course-progress`

Get learner progress report with summary statistics.

| Query Param  | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| `courseId`   | string | Filter by course                     |
| `status`     | string | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `search`     | string | Search by learner name/email         |
| `limit`      | number | Items per page                       |
| `cursor`     | string | Pagination cursor                    |

**Response** `200`:
```json
{
  "summary": {
    "totalEnrolled": 150,
    "completionRate": 0.65,
    "avgProgress": 72.5,
    "avgQuizScore": 85.3
  },
  "rows": [
    {
      "userId": "uuid",
      "userName": "Jane Doe",
      "email": "jane@example.com",
      "progress": 85,
      "completedLessons": 8,
      "totalLessons": 10,
      "quizScore": 92,
      "lastActivity": "2025-01-15T10:30:00Z",
      "status": "IN_PROGRESS"
    }
  ],
  "paging": { "nextCursor": "abc123", "limit": 20 }
}
```

**Frontend hook:** `useCourseProgress(params?)`

---

## Audit Logs

### GET `/admin/audit-logs`

Get admin audit trail (paginated).

| Query Param    | Type   | Description                        |
| -------------- | ------ | ---------------------------------- |
| `resourceType` | string | Filter by resource (e.g., `COURSE`) |
| `search`       | string | Search in action or actor name     |
| `limit`        | number | Items per page                     |
| `cursor`       | string | Pagination cursor                  |

**Response** `200`: `PaginatedResponse<AuditLog>`

```ts
interface AuditLog {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;          // e.g., "CREATE", "UPDATE", "DELETE"
  resourceType: string;    // e.g., "COURSE", "LESSON", "USER"
  resourceId: string;
  data: Record<string, unknown>;   // Action-specific payload
  createdAt: string;
}
```

**Frontend hook:** `useAuditLogs(params?)`

---

## Health

### GET `/health`

Check backend health status.

**Response** `200`:
```json
{
  "status": "ok",
  "uptime": 86400,
  "services": {
    "database": "connected",
    "storage": "connected"
  }
}
```

**Frontend usage:** `healthApi.check()` in SettingsPage (Platform tab)

---

## Frontend Service Map

Quick reference for which service object maps to which endpoints:

| Service Object | File Location       | Endpoints                                    |
| -------------- | ------------------- | -------------------------------------------- |
| `authApi`      | `src/services/api.ts` | `/auth/login`, `/auth/me`, `/auth/refresh` |
| `coursesApi`   | `src/services/api.ts` | `/courses/*`                               |
| `lessonsApi`   | `src/services/api.ts` | `/courses/:id/lessons`, `/lessons/:id`     |
| `quizzesApi`   | `src/services/api.ts` | `/courses/:id/quizzes`, `/quizzes/:id`     |
| `uploadsApi`   | `src/services/api.ts` | `/uploads/init`, `/uploads/complete`       |
| `reportsApi`   | `src/services/api.ts` | `/reports/course-progress`                 |
| `auditApi`     | `src/services/api.ts` | `/admin/audit-logs`                        |
| `healthApi`    | `src/services/api.ts` | `/health`                                  |
