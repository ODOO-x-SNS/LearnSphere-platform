# Components Reference

> Complete reference for all UI components, layout components, and page components in the LearnSphere Admin Platform.

---

## UI Components (`src/components/ui/`)

All UI components are exported from the barrel file `src/components/ui/index.ts`:

```ts
import { Button, Card, Modal, Badge, Input, Select, Textarea, Tabs, toast } from '../components/ui';
```

---

### Button

Gradient-styled button with multiple variants and loading state.

```tsx
import { Button } from '../components/ui';

<Button variant="primary" size="md" loading={false} icon={<Plus />}>
  Create Course
</Button>
```

**Props** (extends `ButtonHTMLAttributes<HTMLButtonElement>`):

| Prop      | Type                                              | Default     | Description                      |
| --------- | ------------------------------------------------- | ----------- | -------------------------------- |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'success'` | `'primary'` | Visual style variant |
| `size`    | `'sm' \| 'md' \| 'lg'`                           | `'md'`      | Button size                      |
| `loading` | `boolean`                                         | `false`     | Shows spinner, disables button   |
| `icon`    | `ReactNode`                                       | —           | Leading icon element             |

**Variant details:**
- `primary` — Blue gradient (`from-primary-500 to-primary-600`), white text, colored shadow
- `secondary` — White bg, gray border, subtle shadow
- `danger` — Rose gradient, white text
- `ghost` — Transparent, hover shows background
- `success` — Emerald gradient, white text

---

### Card

Container component with optional hover lift effect.

```tsx
<Card hover padding className="custom-class">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Props:**

| Prop        | Type            | Default | Description                               |
| ----------- | --------------- | ------- | ----------------------------------------- |
| `children`  | `ReactNode`     | —       | Card content                              |
| `className` | `string`        | —       | Additional CSS classes                    |
| `padding`   | `boolean`       | `true`  | Apply `p-6` padding                      |
| `hover`     | `boolean`       | `false` | Enable hover lift + shadow + border color |
| `onClick`   | `() => void`    | —       | Click handler (adds cursor-pointer)       |
| `style`     | `CSSProperties` | —       | Inline styles                             |

---

### Modal

Dialog overlay with backdrop blur, scroll lock, and animated entrance.

```tsx
<Modal open={isOpen} onClose={() => setOpen(false)} title="Create Course" size="md">
  <form>...</form>
</Modal>
```

**Props:**

| Prop      | Type                            | Default | Description                  |
| --------- | ------------------------------- | ------- | ---------------------------- |
| `open`    | `boolean`                       | —       | Controls visibility          |
| `onClose` | `() => void`                    | —       | Called on backdrop/X click   |
| `title`   | `string`                        | —       | Header title (optional)      |
| `children`| `ReactNode`                     | —       | Modal body content           |
| `size`    | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Max-width class              |

**Behavior:**
- Body scroll locked when open
- Click backdrop to dismiss
- `animate-fade-in` entrance animation
- Header rendered with `bg-surface-dim/50` tint only when `title` is provided

---

### Badge

Inline status indicator with optional colored dot.

```tsx
<Badge variant="success" dot>Published</Badge>
<Badge variant="warning">Draft</Badge>
```

**Props:**

| Prop      | Type                                                          | Default     | Description             |
| --------- | ------------------------------------------------------------- | ----------- | ----------------------- |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color scheme           |
| `dot`     | `boolean`                                                     | `false`     | Show colored dot prefix |
| `className`| `string`                                                     | —           | Additional classes      |

---

### Input

Text input with label, error, and hint support.

```tsx
<Input
  label="Course Title"
  placeholder="Enter title..."
  error={errors.title}
  hint="Maximum 100 characters"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

**Props** (extends `InputHTMLAttributes<HTMLInputElement>`):

| Prop    | Type     | Default | Description                    |
| ------- | -------- | ------- | ------------------------------ |
| `label` | `string` | —       | Label text above input         |
| `error` | `string` | —       | Error message (red border)     |
| `hint`  | `string` | —       | Hint text below input (gray)   |

**Behavior:** Auto-generates `id` from label text. Error state changes border to `border-danger-500`.

---

### Select

Dropdown select with custom chevron icon overlay.

```tsx
<Select
  label="Visibility"
  options={[
    { value: 'EVERYONE', label: 'Everyone' },
    { value: 'ENROLLED', label: 'Enrolled only' },
    { value: 'INVITATION', label: 'Invitation only' },
  ]}
  value={visibility}
  onChange={(e) => setVisibility(e.target.value)}
/>
```

**Props** (extends `SelectHTMLAttributes<HTMLSelectElement>`):

| Prop      | Type                                   | Default | Description            |
| --------- | -------------------------------------- | ------- | ---------------------- |
| `label`   | `string`                               | —       | Label text             |
| `error`   | `string`                               | —       | Error message          |
| `options` | `Array<{ value: string; label: string }>` | —    | Dropdown options       |

---

### Textarea

Multi-line text input (same styling conventions as Input).

**Props** (extends `TextareaHTMLAttributes<HTMLTextAreaElement>`):

| Prop    | Type     | Default | Description                |
| ------- | -------- | ------- | -------------------------- |
| `label` | `string` | —       | Label text above textarea  |
| `error` | `string` | —       | Error message              |

---

### Tabs

Tab navigation with animated content switching.

```tsx
<Tabs
  defaultTab="content"
  tabs={[
    { id: 'content', label: 'Content', icon: <BookOpen />, content: <ContentTab /> },
    { id: 'description', label: 'Description', icon: <FileText />, content: <DescriptionTab /> },
    { id: 'options', label: 'Options', icon: <Settings />, content: <OptionsTab /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Brain />, content: <QuizTab /> },
  ]}
/>
```

**Props:**

| Prop         | Type                                                               | Default     | Description          |
| ------------ | ------------------------------------------------------------------ | ----------- | -------------------- |
| `tabs`       | `Array<{ id: string; label: string; icon?: ReactNode; content: ReactNode }>` | — | Tab definitions |
| `defaultTab` | `string`                                                           | First tab   | Initially active tab |
| `className`  | `string`                                                           | —           | Container classes    |

**Behavior:**
- Active tab has `text-primary-700` color + animated bottom indicator bar
- Content area has `animate-fade-in` when switching tabs
- Manages its own state internally

---

### Toast

Global toast notification system using singleton pattern.

```tsx
import { toast } from '../components/ui';

// Trigger from anywhere
toast.success('Course created successfully');
toast.error('Failed to delete course');
toast.warning('Unsaved changes');
toast.info('New version available');
```

**API:**

| Method           | Description                        |
| ---------------- | ---------------------------------- |
| `toast.success(message)` | Green success toast        |
| `toast.error(message)`   | Red error toast            |
| `toast.warning(message)` | Amber warning toast        |
| `toast.info(message)`    | Blue info toast            |

**Behavior:**
- Auto-dismisses after 4 seconds
- Stacks up to 5 toasts
- Positioned bottom-right (fixed)
- Uses `ring-1` colored border per variant type

**Container:** `<ToastContainer />` must be rendered once (placed in `AdminLayout`).

---

### Skeleton / CardSkeleton / TableSkeleton

Loading placeholder components.

```tsx
<CardSkeleton />                 // Card with shimmer cover placeholder
<TableSkeleton rows={5} cols={4} /> // Table grid skeleton
```

**CardSkeleton:** Renders a `rounded-2xl` card with a shimmer cover area and text placeholders.

**TableSkeleton Props:**

| Prop   | Type   | Default | Description             |
| ------ | ------ | ------- | ----------------------- |
| `rows` | number | 5       | Number of skeleton rows |
| `cols` | number | 4       | Number of columns       |

---

### EmptyState

Empty data placeholder with icon and message.

```tsx
<EmptyState
  icon={<BookOpen />}
  title="No courses yet"
  description="Create your first course to get started."
/>
```

**Props:**

| Prop          | Type        | Default | Description               |
| ------------- | ----------- | ------- | ------------------------- |
| `icon`        | `ReactNode` | —       | Icon element              |
| `title`       | `string`    | —       | Heading text              |
| `description` | `string`    | —       | Supporting text           |

---

## Layout Components (`src/components/layout/`)

### AdminLayout

Auth-guarded layout wrapper for all `/admin/*` routes.

**Behavior:**
1. Checks `useAuthStore.isAuthenticated`
2. If not authenticated → `<Navigate to="/login" />`
3. Calls `useMe()` to fetch/refresh user data
4. Shows centered spinner during loading
5. Renders: `Sidebar` (left) + `main` area with `<Outlet />` + `<ToastContainer />`

---

### Sidebar

Collapsible navigation sidebar.

**Behavior:**
- Toggle button collapses between 260px (expanded) and 72px (collapsed)
- Navigation items: Dashboard, Courses, Reports, Audit, Settings
- Uses `NavLink` from React Router with `isActive` styling
- Active state: `bg-primary-50 text-primary-700 ring-1 ring-primary-100`
- Bottom section: User avatar + name + logout button
- Gradient logo icon at top

---

### Header

Sticky top bar with search and notifications.

**Props:**

| Prop      | Type        | Default | Description                      |
| --------- | ----------- | ------- | -------------------------------- |
| `title`   | `string`    | —       | Page title (left side)           |
| `actions` | `ReactNode` | —       | Action buttons (right side)      |

**Behavior:**
- Sticky `top-0` with `bg-white/80 backdrop-blur-xl`
- Expandable search input (toggle via Search icon)
- Notification bell with red indicator dot
- Divider between notification bell and actions slot

---

## Page Components (`src/pages/`)

### LoginPage (`/login`)

Split-screen login with decorative panel.

- **Left panel:** Logo, email/password form, "Remember me" checkbox, demo credentials card
- **Right panel:** Decorative gradient background with abstract circles and stats (500+ courses, 12K+ learners, 98% satisfaction)
- **Hooks used:** `useLogin()`, `useAuthStore`
- **Navigation:** On success → `/admin`

---

### DashboardPage (`/admin`)

Overview page with statistics and recent activity.

- **Stats cards (4):** Total courses, total learners, completion rate, avg quiz score
- **Recent courses:** List from `useCourses()` showing title, creation date, lesson count
- **Quick actions:** Create course, view reports, manage settings
- **Hooks used:** `useCourses()`, `useCourseProgress()`

---

### CoursesPage (`/admin/courses`)

Course management with grid/list views.

- **View modes:** Grid (card layout) / List (table layout)
- **Search:** Filter by course title
- **Filter tabs:** All / Published / Draft
- **CRUD modals:** Create course, Delete confirmation
- **Course cards:** Cover image area, status badge, tags, stats (lessons, duration)
- **Context menu:** Edit, Preview, Publish/Unpublish, Invite, Delete
- **Hooks used:** `useCourses()`, `useCreateCourse()`, `useDeleteCourse()`
- **Navigation:** Edit → `/admin/courses/:id/edit`

---

### CourseFormPage (`/admin/courses/:id/edit`)

Tabbed course editor.

- **Header:** Back button, course title, Publish toggle, Invite button, Preview button
- **Tabs:**
  1. **Content** (ContentTab) — Lesson management
  2. **Description** (DescriptionTab) — Title, description, website URL
  3. **Options** (OptionsTab) — Visibility, access rules, pricing
  4. **Quizzes** (QuizTab) — Quiz builder
- **Invite modal:** Textarea for comma/newline separated emails
- **Hooks used:** `useCourse(id)`, `useUpdateCourse(id)`, `useTogglePublish(id)`, `useInviteToCourse(id)`

---

### ContentTab

Lesson CRUD within a course.

- **Lesson list:** Sortable cards with grip handles, type-specific icons/colors
- **Type icons:** VIDEO=primary blue, DOCUMENT=accent violet, IMAGE=success green, QUIZ=warning amber
- **Create/edit modal:** Grid form with title, type select, duration, external URL (VIDEO), description, allowDownload checkbox
- **Hooks used:** `useCreateLesson(courseId)`, `useUpdateLesson(courseId)`, `useDeleteLesson(courseId)`

---

### DescriptionTab

Course metadata editor.

- **Fields:** Title (Input), Description (Textarea), Website URL (Input)
- **Tips card:** Writing tips for effective descriptions
- **Save button:** Calls `useUpdateCourse(id)`

---

### OptionsTab

Course visibility and access configuration.

- **Visibility select:** EVERYONE / ENROLLED / INVITATION
- **Access rule cards:** Visual cards for FREE, PAYMENT, INVITATION with icons and descriptions
- **Conditional price input:** Appears only when PAYMENT is selected
- **Tips card:** Access rule explanations
- **Save button:** Calls `useUpdateCourse(id)`

---

### QuizTab

Quiz builder with nested questions and options.

- **Quiz cards grid:** Lists all quizzes with title, points, question count
- **Create quiz modal:**
  - Title input, points first try, points second try
  - Dynamic questions list (Add/remove questions)
  - Per-question: text, multipleSelection toggle, dynamic options (Add/remove)
  - Per-option: text, isCorrect toggle
- **Delete confirmation modal**
- **Hooks used:** `useCreateQuiz(courseId)`, `useDeleteQuiz(courseId)`

---

### ReportsPage (`/admin/reports`)

Learner progress analytics.

- **Summary cards (4):** Total enrolled, completion rate, avg progress, avg quiz score
- **Filters:** Search by name, course select dropdown, status select dropdown
- **Progress table:** Avatar, name, email, progress bar, lessons completed, quiz score, status badge, last activity date
- **Hooks used:** `useCourseProgress(params)`

---

### AuditPage (`/admin/audit`)

Admin activity timeline.

- **Resource type filter:** All / Course / Lesson / Quiz / User
- **Search:** Filter by action or actor name
- **Timeline cards:** Action-colored icons (CREATE=green, DELETE=red, UPDATE=blue), actor name, badges, relative time, JSON data preview
- **Hooks used:** `useAuditLogs(params)`

---

### SettingsPage (`/admin/settings`)

Platform settings with 4 sub-tabs:

1. **Profile** — Avatar display, name/email inputs
2. **Security** — Change password form (current + new + confirm), 2FA toggle
3. **Notifications** — Toggle switches (email notifications, enrollment alerts, completion notifications, review alerts)
4. **Platform** — Health status indicators with pulsing dots, branding inputs (platform name, support email)

**Hooks used:** `useMe()`, `healthApi.check()` (in Platform tab)
