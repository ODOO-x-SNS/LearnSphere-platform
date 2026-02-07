# Architecture

> Technical architecture of the LearnSphere Admin Platform — data flow, module boundaries, design patterns, and key decisions.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser                                     │
│                                                                      │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────────────────┐   │
│  │  Zustand    │   │ React Query  │   │    React Router DOM      │   │
│  │  Auth Store │   │  Query Cache │   │    (BrowserRouter)       │   │
│  └─────┬──────┘   └──────┬───────┘   └────────────┬─────────────┘   │
│        │                 │                         │                  │
│        │     ┌───────────┴───────────┐             │                  │
│        │     │  React Query Hooks    │             │                  │
│        │     │  (src/hooks/useApi)   │             │                  │
│        │     └───────────┬───────────┘             │                  │
│        │                 │                         │                  │
│        │     ┌───────────┴───────────┐             │                  │
│        ├────▶│  API Services         │             │                  │
│        │     │  (src/services/api)   │             │                  │
│        │     └───────────┬───────────┘             │                  │
│        │                 │                         │                  │
│        │     ┌───────────┴───────────┐             │                  │
│        └────▶│  Axios Instance       │             │                  │
│              │  (src/lib/api)        │             │                  │
│              └───────────┬───────────┘             │                  │
│                          │                         │                  │
└──────────────────────────┼─────────────────────────┼──────────────────┘
                           │                         │
                    ┌──────┴──────┐                  │
                    │ Vite Proxy  │                  │
                    │ /api → :3000│                  │
                    └──────┬──────┘                  │
                           │                         │
                    ┌──────┴──────┐                  │
                    │ Backend API │                  │
                    │ :3000       │                  │
                    └─────────────┘                  │
```

---

## Module Architecture

### 1. Entry Layer

| File            | Responsibility                                               |
| --------------- | ------------------------------------------------------------ |
| `index.html`    | HTML shell — loads Inter font, sets viewport, mounts `#root` |
| `src/main.tsx`  | React 19 `createRoot` + `StrictMode`, imports global CSS     |
| `src/App.tsx`   | Composes `QueryClientProvider` + `BrowserRouter` + routes    |

### 2. Type Definitions (`src/types/index.ts`)

All shared interfaces live in a single file, matching the backend API contracts exactly:

| Type                | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `User`              | id, email, name, role (ADMIN/INSTRUCTOR/LEARNER), totalPoints, avatarUrl |
| `Course`            | Full course entity with lessons[], quizzes[], visibility, accessRule, price |
| `Lesson`            | Course lesson — type is VIDEO/DOCUMENT/IMAGE/QUIZ    |
| `Quiz`              | Quiz with questions[] array                           |
| `Question`          | Quiz question with options[] and multipleSelection    |
| `QuizOption`        | Answer option with isCorrect flag                     |
| `UploadInitResponse`| uploadUrl + fileId from upload init endpoint          |
| `FileMetadata`      | Completed upload metadata (id, url, filename, mimeType, size) |
| `Invitation`        | Course invitation (PENDING/ACCEPTED/EXPIRED)          |
| `ReportRow`         | Individual learner progress row                       |
| `ReportSummary`     | Aggregated report metrics                             |
| `AuditLog`          | Admin audit trail entry                               |
| `Review`            | Course review (rating + text)                         |
| `Paging`            | Cursor-based pagination (nextCursor + limit)          |
| `PaginatedResponse<T>` | Generic paginated wrapper — `{ data: T[], paging }` |
| `ApiError`          | Standardized error shape from backend                 |

### 3. HTTP Layer

#### Axios Instance (`src/lib/api.ts`)

```
api = axios.create({ baseURL: '/api/v1', withCredentials: true })
```

**Request interceptor:**
- Reads `accessToken` from Zustand auth store
- Attaches `Authorization: Bearer <token>` header

**Response interceptor (401 handling):**
1. On 401 response, calls `POST /api/v1/auth/refresh` (cookie-based)
2. If refresh succeeds → updates Zustand store → retries original request
3. If refresh fails → calls `logout()` → redirects to `/login`
4. Uses `_retry` flag to prevent infinite loops

#### API Services (`src/services/api.ts`)

Thin wrappers over the Axios instance, organized by domain:

| Service      | Endpoints                                              |
| ------------ | ------------------------------------------------------ |
| `authApi`    | `login`, `me`, `refresh`                               |
| `coursesApi` | `list`, `get`, `create`, `update`, `publish`, `unpublish`, `delete`, `invite`, `reviews` |
| `lessonsApi` | `create`, `update`, `delete`                           |
| `quizzesApi` | `create`, `get`, `update`, `delete`                    |
| `uploadsApi` | `init`, `complete`                                     |
| `reportsApi` | `courseProgress`                                       |
| `auditApi`   | `logs`                                                 |
| `healthApi`  | `check`                                                |

#### File Upload (`src/lib/upload.ts`)

Three-step presigned URL flow:

```
1. POST /api/v1/uploads/init     → { uploadUrl, fileId }
2. PUT  <uploadUrl>  (XHR)       → Direct upload with progress callback
3. POST /api/v1/uploads/complete  → { file: FileMetadata }
```

Uses raw `XMLHttpRequest` for the PUT step to support `upload.onprogress`.

### 4. State Layer

#### Client State — Zustand (`src/store/auth.ts`)

Minimal store with only authentication concern:

```ts
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;   // derived: !!accessToken
  setAccessToken(token: string): void;
  setUser(user: User): void;
  logout(): void;
}
```

**Why Zustand over Context?** The auth store is read by the Axios interceptor (`useAuthStore.getState()`) which runs outside React's component tree. Zustand's vanilla `getState()` makes this seamless.

#### Server State — React Query (`src/hooks/useApi.ts`)

Every API call has a corresponding hook. Pattern:

```ts
// Queries — auto-cached, refetched, deduplicated
export function useCourses(params?) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.list(params).then(r => r.data),
  });
}

// Mutations — with cache invalidation
export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => coursesApi.create(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}
```

**Cache invalidation strategy:**
- Creating/deleting a course → invalidates `['courses']` list
- Updating a course → invalidates both `['course', id]` and `['courses']`
- Lesson/Quiz CRUD → invalidates parent `['course', courseId]`
- `useTogglePublish` uses **optimistic updates** with rollback on error

**Query key hierarchy:**

```
['me']
['courses', params?]
['course', id]
['reviews', courseId]
['quiz', id]
['reports', 'course-progress', params?]
['audit-logs', params?]
```

### 5. Component Layer

#### Design System (`src/components/ui/`)

12 primitive components with consistent styling conventions:

- Rounded corners: `rounded-xl` (inputs/buttons) or `rounded-2xl` (cards/modals)
- Shadows: `shadow-xs` (default), `shadow-sm` (primary buttons), `shadow-2xl` (modals)
- Focus: `focus-visible:ring-2 ring-primary-300 ring-offset-2`
- Transitions: `transition-all duration-150` (fast micro-interactions)
- Typography: `text-[13px] font-semibold` for labels, `text-sm` for body

All components are exported from `src/components/ui/index.ts` barrel.

#### Layout Components (`src/components/layout/`)

| Component      | Responsibility                                                    |
| -------------- | ----------------------------------------------------------------- |
| `AdminLayout`  | Auth guard (redirect if !authenticated), `useMe()` call, flex container with Sidebar + Outlet + ToastContainer |
| `Sidebar`      | Collapsible nav (260px ↔ 72px), NavLink items with active states, user avatar, logout button |
| `Header`       | Sticky top bar with backdrop blur, expandable search, notification bell, action slot |

#### Pages (`src/pages/`)

Each page is a self-contained module in its own folder:

| Page                  | Key Features                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `LoginPage`           | Split-screen layout, email/password form, demo credentials display |
| `DashboardPage`       | 4 stat cards from API data, recent courses, quick action links     |
| `CoursesPage`         | Grid/List toggle, search/filter, create modal, delete confirm, context menu |
| `CourseFormPage`      | Tabbed editor (4 tabs), invite modal, publish/unpublish toggle     |
| `ContentTab`          | Lesson CRUD with type-specific icons, sort order display           |
| `DescriptionTab`      | Title/description/URL editing with tips card                       |
| `OptionsTab`          | Visibility select, access rule cards, conditional price input      |
| `QuizTab`             | Quiz builder — create quizzes with questions + options             |
| `ReportsPage`         | Summary cards, search/filter, progress table with bars/avatars     |
| `AuditPage`           | Timeline log cards, resource type filter, action badges            |
| `SettingsPage`        | 4 sub-tabs (Profile/Security/Notifications/Platform)               |

---

## Styling Architecture

### Tailwind CSS v4

This project uses **Tailwind v4** with the Vite plugin (not PostCSS):

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
plugins: [react(), tailwindcss()]
```

### Design Tokens

All tokens defined in `src/index.css` via `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-primary-500: #3b82f6;    /* Blue */
  --color-accent-500: #8b5cf6;     /* Violet */
  --color-success-500: #10b981;    /* Emerald */
  --color-warning-500: #f59e0b;    /* Amber */
  --color-danger-500: #f43f5e;     /* Rose */
  --color-surface: #ffffff;
  /* ... full scale defined for each */
}
```

**Key convention:** Colors use a 50–900 scale. Semantic tokens (`surface`, `border`, `text-primary/secondary/muted`) map to specific neutrals.

### Animations

Three custom animations available globally:

| Class              | Effect                                    | Duration |
| ------------------ | ----------------------------------------- | -------- |
| `animate-fade-in`  | Fade in + slide up 6px                    | 0.35s    |
| `animate-slide-in` | Fade in + slide left 8px                  | 0.3s     |
| `animate-shimmer`  | Horizontal gradient sweep (skeleton loading) | 1.8s loop |

---

## Authentication Flow

```
1. User submits email/password on LoginPage
2. useLogin() → POST /api/v1/auth/login
3. Backend returns { accessToken, user }
4. Zustand store: setAccessToken(token), setUser(user)
5. React Router navigates to /admin
6. AdminLayout checks isAuthenticated → renders Outlet
7. All subsequent API calls include Bearer token (Axios interceptor)

Token Refresh:
1. Any API call returns 401
2. Axios interceptor calls POST /api/v1/auth/refresh (cookie-based)
3. New accessToken stored in Zustand
4. Original request retried with new token
5. If refresh fails → logout() + redirect to /login
```

---

## Key Design Decisions

| Decision                           | Rationale                                                      |
| ---------------------------------- | -------------------------------------------------------------- |
| Zustand over Context               | Auth token needed in Axios interceptor (outside React tree)    |
| React Query over local state       | Automatic caching, deduplication, background refetching        |
| Tailwind v4 @theme over config     | CSS-native tokens, no `tailwind.config.js` needed              |
| Barrel exports for UI              | Clean imports: `from '@/components/ui'`                        |
| Cursor-based pagination            | Backend uses cursor pagination (nextCursor), not page numbers  |
| Optimistic updates for publish     | Instant UI feedback on toggle, rollback on failure             |
| `verbatimModuleSyntax`             | Enforces `import type` for type-only imports (tree-shaking)    |
| Collocated page folders            | Each page in its own folder for easy feature isolation          |

---

## File Dependency Graph

```
main.tsx
  └── App.tsx
        ├── QueryClientProvider (React Query)
        └── BrowserRouter (React Router)
              ├── /login → LoginPage
              │     └── useLogin() → authApi.login
              │
              └── /admin → AdminLayout
                    ├── useMe() → authApi.me
                    ├── Sidebar (navigation links)
                    ├── Header (search, notifications)
                    └── Outlet
                          ├── DashboardPage
                          │     ├── useCourses()
                          │     └── useCourseProgress()
                          ├── CoursesPage
                          │     ├── useCourses()
                          │     ├── useCreateCourse()
                          │     └── useDeleteCourse()
                          ├── CourseFormPage
                          │     ├── useCourse(id)
                          │     ├── useUpdateCourse(id)
                          │     ├── useTogglePublish(id)
                          │     ├── useInviteToCourse(id)
                          │     └── Tabs → ContentTab, DescriptionTab, OptionsTab, QuizTab
                          ├── ReportsPage
                          │     └── useCourseProgress()
                          ├── AuditPage
                          │     └── useAuditLogs()
                          └── SettingsPage
                                └── healthApi.check()
```
