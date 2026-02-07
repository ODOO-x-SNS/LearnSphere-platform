# LearnSphere — Admin Platform

> A production-grade **LMS admin dashboard** built with React 19, TypeScript, Tailwind CSS v4, and Vite. Designed for course management, learner progress tracking, and platform administration.

---

## Tech Stack

| Layer            | Technology                               | Version |
| ---------------- | ---------------------------------------- | ------- |
| Framework        | React                                    | 19.2    |
| Language         | TypeScript (strict mode)                 | 5.9     |
| Build Tool       | Vite                                     | 7.x     |
| Styling          | Tailwind CSS v4 (`@tailwindcss/vite`)    | 4.1     |
| Routing          | React Router DOM                         | 7.13    |
| Server State     | TanStack React Query                     | 5.90    |
| Client State     | Zustand                                  | 5.0     |
| HTTP Client      | Axios                                    | 1.13    |
| Icons            | Lucide React                             | 0.563   |
| Utilities        | clsx                                     | 2.1     |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9
- **Backend API** running at `http://localhost:3000` (see [API Reference](docs/API_REFERENCE.md))

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd LearnSphere-platform

# Install dependencies
npm install

# Start the dev server (default: http://localhost:5173)
npm run dev
```

### Available Scripts

| Script          | Command                | Description                          |
| --------------- | ---------------------- | ------------------------------------ |
| `dev`           | `vite`                 | Start dev server with HMR            |
| `build`         | `tsc -b && vite build` | Type-check + production build        |
| `lint`          | `eslint .`             | Run ESLint across the project        |
| `preview`       | `vite preview`         | Preview the production build locally |

---

## Project Structure

```
LearnSphere-platform/
├── index.html                    # Entry HTML — Inter font, viewport meta
├── vite.config.ts                # Vite config — Tailwind plugin + API proxy
├── tsconfig.app.json             # TS config — strict, ES2022, bundler resolution
├── package.json                  # Dependencies & scripts
│
├── public/                       # Static assets (served as-is)
│
├── src/
│   ├── main.tsx                  # React root — StrictMode + createRoot
│   ├── App.tsx                   # Router + QueryClient provider + all routes
│   ├── index.css                 # Tailwind v4 @import + @theme (design tokens)
│   │
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces & types
│   │
│   ├── lib/
│   │   ├── api.ts                # Axios instance + auth/refresh interceptors
│   │   └── upload.ts             # File upload flow (init → PUT → complete)
│   │
│   ├── store/
│   │   └── auth.ts               # Zustand auth store (token, user, logout)
│   │
│   ├── services/
│   │   └── api.ts                # API service objects (auth, courses, lessons, etc.)
│   │
│   ├── hooks/
│   │   └── useApi.ts             # React Query hooks for all API operations
│   │
│   ├── components/
│   │   ├── ui/                   # Design system primitives (Button, Card, Modal…)
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts          # Barrel re-exports
│   │   └── layout/
│   │       ├── AdminLayout.tsx   # Auth guard + Sidebar + Outlet wrapper
│   │       ├── Header.tsx        # Sticky header with search + notifications
│   │       └── Sidebar.tsx       # Collapsible navigation sidebar
│   │
│   └── pages/
│       ├── Login/
│       │   └── LoginPage.tsx     # Split-screen login form
│       ├── Dashboard/
│       │   └── DashboardPage.tsx # Stats cards + recent courses + quick actions
│       ├── Courses/
│       │   ├── CoursesPage.tsx   # Course grid/list with search, filter, CRUD
│       │   ├── CourseFormPage.tsx # Tabbed course editor (Content/Desc/Options/Quizzes)
│       │   └── tabs/
│       │       ├── ContentTab.tsx      # Lesson management
│       │       ├── DescriptionTab.tsx  # Title, description, URL
│       │       ├── OptionsTab.tsx      # Visibility, access rules, pricing
│       │       └── QuizTab.tsx         # Quiz builder with questions & options
│       ├── Reports/
│       │   └── ReportsPage.tsx   # Learner progress reports & analytics
│       ├── Audit/
│       │   └── AuditPage.tsx     # Admin audit log timeline
│       └── Settings/
│           └── SettingsPage.tsx  # Profile, security, notifications, platform
│
└── docs/                         # Technical documentation
    ├── ARCHITECTURE.md           # System architecture & data flow
    ├── API_REFERENCE.md          # Backend endpoint contracts
    ├── COMPONENTS.md             # UI component library reference
    └── DEVELOPMENT.md            # Dev workflow, patterns, troubleshooting
```

---

## Environment & Configuration

### Vite Dev Server

The dev server proxies all `/api` requests to the backend:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
}
```

This means the frontend calls `/api/v1/courses` and Vite forwards it to `http://localhost:3000/api/v1/courses`.

### TypeScript

- **Strict mode** enabled (`strict: true` in `tsconfig.app.json`)
- Target: ES2022, Module: ESNext, JSX: react-jsx
- `noUnusedLocals` and `noUnusedParameters` set to `false` (relaxed for dev iteration)
- Uses `verbatimModuleSyntax` — all type imports must use `import type`

### Tailwind CSS v4

Uses the new Vite plugin (`@tailwindcss/vite`) instead of PostCSS. Theme tokens are defined via CSS `@theme` in `src/index.css`:

- **Colors**: primary (blue), accent (violet), success (emerald), warning (amber), danger (rose), surface/border/text (slate/gray neutrals)
- **Animations**: `fade-in`, `slide-in`, `shimmer`
- **Font**: Inter (300–800 weights via Google Fonts)

---

## Routing

| Path                      | Page              | Auth Required |
| ------------------------- | ----------------- | ------------- |
| `/login`                  | LoginPage         | No            |
| `/admin`                  | DashboardPage     | Yes           |
| `/admin/courses`          | CoursesPage       | Yes           |
| `/admin/courses/:id/edit` | CourseFormPage     | Yes           |
| `/admin/reports`          | ReportsPage       | Yes           |
| `/admin/audit`            | AuditPage         | Yes           |
| `/admin/settings`         | SettingsPage      | Yes           |
| `*`                       | Redirect → /login | —             |

All `/admin/*` routes are wrapped by `AdminLayout`, which checks authentication via `useAuthStore.isAuthenticated` and redirects unauthenticated users to `/login`.

---

## State Management

### Auth (Zustand)

```
useAuthStore
├── accessToken: string | null
├── user: User | null
├── isAuthenticated: boolean (derived from !!accessToken)
├── setAccessToken(token) → sets token + isAuthenticated=true
├── setUser(user)
└── logout() → clears token + user + isAuthenticated
```

### Server State (React Query)

All API data is managed through TanStack React Query hooks (`src/hooks/useApi.ts`). Default config:

- `staleTime`: 30 seconds
- `retry`: 1 attempt
- `refetchOnWindowFocus`: disabled

Mutations automatically invalidate related query caches on success.

---

## Documentation

| Document                                      | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)       | System architecture, data flow, patterns   |
| [API_REFERENCE.md](docs/API_REFERENCE.md)     | Complete backend API endpoint contracts    |
| [COMPONENTS.md](docs/COMPONENTS.md)           | UI component props, variants, usage        |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md)         | Dev workflow, adding features, conventions |

---

## License

Private — not for redistribution.
