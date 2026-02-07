# Development Guide

> Workflows, conventions, patterns, and troubleshooting for developing on the LearnSphere Admin Platform.

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend

The frontend expects a backend API at `http://localhost:3000`. Start your backend server before running the frontend. All `/api` requests are proxied automatically by Vite.

### 3. Start the Dev Server

```bash
npm run dev
```

Dev server runs at `http://localhost:5173` with hot module replacement (HMR).

### 4. Type-Check

```bash
npx tsc --noEmit
```

This runs the TypeScript compiler in check-only mode. Must pass with zero errors before committing.

### 5. Build for Production

```bash
npm run build    # tsc -b && vite build
```

Output goes to `dist/`.

---

## Code Conventions

### File Organization

- **One component per file** — component name matches filename
- **Named exports** for all components (not default exports), except `App.tsx`
- **Collocated pages** — each page gets its own folder under `src/pages/`
- **Barrel exports** — `src/components/ui/index.ts` re-exports all UI components

### Import Order

1. React / third-party libraries
2. Components (layout → UI → page-specific)
3. Hooks
4. Services / lib
5. Types (always `import type`)
6. Assets / styles

### TypeScript

- **`import type`** is mandatory for type-only imports (`verbatimModuleSyntax` is enabled)
- All interfaces live in `src/types/index.ts`
- Component props use inline interfaces when simple, separate when complex
- API responses are typed through service functions

### Styling

- **Tailwind utility classes only** — no CSS modules, no styled-components
- Use design tokens from `src/index.css` `@theme` (e.g., `bg-primary-500`, `text-text-muted`)
- Use `clsx()` for conditional class merging
- Common patterns:
  - Rounded corners: `rounded-xl` (inputs), `rounded-2xl` (cards/modals)
  - Shadows: `shadow-xs` (cards), `shadow-sm` (primary buttons), `shadow-2xl` (modals)
  - Focus: `focus-visible:ring-2 ring-primary-300 ring-offset-2`
  - Transitions: `transition-all duration-150`

---

## Common Patterns

### Adding a New API Endpoint

**Step 1:** Add types to `src/types/index.ts`:

```ts
export interface NewEntity {
  id: string;
  name: string;
  // ...
}
```

**Step 2:** Add service function to `src/services/api.ts`:

```ts
export const newEntityApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<NewEntity>>('/new-entities', { params }),
  get: (id: string) => api.get<NewEntity>(`/new-entities/${id}`),
  create: (data: Partial<NewEntity>) =>
    api.post<NewEntity>('/new-entities', data),
};
```

**Step 3:** Add React Query hooks to `src/hooks/useApi.ts`:

```ts
export function useNewEntities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['new-entities', params],
    queryFn: () => newEntityApi.list(params).then((r) => r.data),
  });
}

export function useCreateNewEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NewEntity>) =>
      newEntityApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['new-entities'] });
    },
  });
}
```

### Adding a New Page

**Step 1:** Create the page component:

```bash
src/pages/NewPage/
  └── NewPage.tsx
```

```tsx
import { Card, Button } from '../../components/ui';
import { Header } from '../../components/layout/Header';
import { useNewEntities } from '../../hooks/useApi';

export function NewPage() {
  const { data, isLoading } = useNewEntities();
  // ...
}
```

**Step 2:** Add the route in `src/App.tsx`:

```tsx
import { NewPage } from './pages/NewPage/NewPage';

// Inside the /admin route:
<Route path="new-page" element={<NewPage />} />
```

**Step 3:** Add nav link in `src/components/layout/Sidebar.tsx`:

```tsx
{ to: '/admin/new-page', icon: <IconName />, label: 'New Page' }
```

### Adding a New UI Component

**Step 1:** Create the component in `src/components/ui/`:

```tsx
// src/components/ui/NewComponent.tsx
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface NewComponentProps {
  children: ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
}

export function NewComponent({ children, variant = 'default', className }: NewComponentProps) {
  return (
    <div className={clsx('base-classes', variants[variant], className)}>
      {children}
    </div>
  );
}
```

**Step 2:** Add to barrel export in `src/components/ui/index.ts`:

```ts
export { NewComponent } from './NewComponent';
```

### Cache Invalidation Pattern

When a mutation affects related data, invalidate the appropriate query keys:

```ts
export function useUpdateItem(parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => itemApi.update(id, data).then(r => r.data),
    onSuccess: () => {
      // Invalidate the specific item
      qc.invalidateQueries({ queryKey: ['item', parentId] });
      // Also invalidate the parent list
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

**Query key naming:**
- Lists: `['resource-name', params?]` — e.g., `['courses', { published: true }]`
- Single items: `['resource-name', id]` — e.g., `['course', 'abc123']`
- Nested: `['parent', 'child', params?]` — e.g., `['reports', 'course-progress']`

### Optimistic Updates

Used for instant UI feedback (example: publish toggle):

```ts
useMutation({
  mutationFn: (shouldPublish) => ...,
  onMutate: async (shouldPublish) => {
    await qc.cancelQueries({ queryKey: ['course', id] });
    const previous = qc.getQueryData(['course', id]);
    qc.setQueryData(['course', id], (old) =>
      old ? { ...old, published: shouldPublish } : old
    );
    return { previous };
  },
  onError: (_err, _vars, context) => {
    if (context?.previous) qc.setQueryData(['course', id], context.previous);
  },
  onSettled: () => {
    qc.invalidateQueries({ queryKey: ['course', id] });
  },
});
```

### Toast Notifications

```ts
import { toast } from '../components/ui';

// In mutation callbacks:
onSuccess: () => {
  toast.success('Course created successfully');
},
onError: (err) => {
  toast.error(err.response?.data?.error?.message || 'Something went wrong');
},
```

---

## Key Files Quick Reference

| File                           | Purpose                                     | When to Edit                                |
| ------------------------------ | ------------------------------------------- | ------------------------------------------- |
| `src/types/index.ts`          | All TypeScript interfaces                   | Adding new API entities                     |
| `src/services/api.ts`         | API service functions                       | Adding new endpoints                        |
| `src/hooks/useApi.ts`         | React Query hooks                           | Adding queries/mutations for new endpoints  |
| `src/lib/api.ts`              | Axios instance + interceptors               | Changing auth flow or base URL              |
| `src/store/auth.ts`           | Auth state management                       | Adding global client state                  |
| `src/App.tsx`                 | Routes + providers                          | Adding new pages/routes                     |
| `src/index.css`               | Design tokens + global styles               | Changing colors, animations, fonts          |
| `src/components/ui/index.ts`  | Component barrel exports                    | After creating new UI components            |
| `vite.config.ts`              | Build config + dev proxy                    | Changing proxy target or adding plugins     |
| `tsconfig.app.json`           | TypeScript compiler options                 | Changing strictness or compile targets      |

---

## Troubleshooting

### Stale VS Code Editor Errors

**Symptom:** VS Code shows red squigglies on valid imports, but `npx tsc --noEmit` passes cleanly.

**Cause:** VS Code's TypeScript language server cache becomes stale after file creation/deletion.

**Fix:**
1. Run `Developer: Restart Extension Host` from the Command Palette (`Ctrl+Shift+P`)
2. Or close and reopen the file
3. Verify with `npx tsc --noEmit` — if it passes, the error is cosmetic

---

### API Proxy Not Working

**Symptom:** Network requests to `/api/v1/...` return 404 or connection refused.

**Cause:** Backend not running at `http://localhost:3000`.

**Fix:**
1. Ensure the backend server is running on port 3000
2. Check `vite.config.ts` proxy configuration
3. Check browser DevTools Network tab for the actual request URL

---

### Tailwind Classes Not Applying

**Symptom:** Custom design tokens (e.g., `bg-primary-500`) don't render.

**Cause:** Tailwind v4 uses `@import "tailwindcss"` + `@theme` in CSS, not `tailwind.config.js`.

**Fix:**
1. Ensure `src/index.css` has `@import "tailwindcss"` as the first line
2. Ensure the `@theme` block defines the token (e.g., `--color-primary-500`)
3. Ensure `@tailwindcss/vite` plugin is in `vite.config.ts`

---

### 401 Redirect Loop

**Symptom:** Page constantly redirects to `/login` even after logging in.

**Cause:** Token not persisted across page refreshes (Zustand store is in-memory).

**Note:** The current implementation stores the access token in memory only. A full page refresh will lose the session. The backend's `/auth/refresh` endpoint (cookie-based) is the mechanism for session persistence.

---

### TypeScript `import type` Errors

**Symptom:** `TS1484: 'X' is a type and must be imported using a type-only import`

**Cause:** `verbatimModuleSyntax` is enabled in `tsconfig.app.json`.

**Fix:** Use `import type` for type-only imports:

```ts
// ✗ Wrong
import { User, Course } from '../types';

// ✓ Correct (if only used as types)
import type { User, Course } from '../types';
```

---

## Design Token Reference

Quick lookup for common design tokens defined in `src/index.css`:

### Colors

| Token             | Value     | Usage                     |
| ----------------- | --------- | ------------------------- |
| `primary-500`     | `#3b82f6` | Primary blue              |
| `primary-600`     | `#2563eb` | Primary blue (dark)       |
| `accent-500`      | `#8b5cf6` | Accent violet             |
| `success-500`     | `#10b981` | Success green             |
| `warning-500`     | `#f59e0b` | Warning amber             |
| `danger-500`      | `#f43f5e` | Danger rose               |
| `surface`         | `#ffffff` | White background          |
| `surface-dim`     | `#f8fafc` | Slight gray background    |
| `surface-hover`   | `#f1f5f9` | Hover background          |
| `border`          | `#e2e8f0` | Default border color      |
| `text-primary`    | `#0f172a` | Main text color           |
| `text-secondary`  | `#334155` | Secondary text color      |
| `text-muted`      | `#94a3b8` | Muted/placeholder text    |

### Animations

| Token              | Class                | Effect                                |
| ------------------ | -------------------- | ------------------------------------- |
| `--animate-fade-in` | `animate-fade-in`   | Fade in + 6px slide up (0.35s)        |
| `--animate-slide-in`| `animate-slide-in`  | Fade in + 8px slide left (0.3s)       |
| `--animate-shimmer` | `animate-shimmer`   | Horizontal gradient sweep (1.8s loop) |
