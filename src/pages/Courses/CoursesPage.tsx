import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, List, Filter, BookOpen,
  Clock, BarChart3, MoreHorizontal, Eye, Edit3, Trash2,
  Globe, Send,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button, Card, Badge, Modal, Input, EmptyState, CardSkeleton } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { useCourses, useCreateCourse, useDeleteCourse, useTogglePublish } from '../../hooks/useApi';
import { clsx } from 'clsx';
import type { Course } from '../../types';

type ViewMode = 'grid' | 'list';

export function CoursesPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data, isLoading } = useCourses({ search: search || undefined, limit: 50 });
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();

  const courses = data?.data?.filter((c: Course) => {
    if (filter === 'published') return c.published;
    if (filter === 'draft') return !c.published;
    return true;
  }) || [];

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createCourse.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: (course) => {
          setCreateOpen(false);
          setNewTitle('');
          toast('success', 'Course created!');
          navigate(`/admin/courses/${course.id}/edit`);
        },
        onError: () => toast('error', 'Failed to create course'),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCourse.mutate(id, {
      onSuccess: () => {
        toast('success', 'Course deleted');
        setDeleteConfirm(null);
      },
      onError: () => toast('error', 'Failed to delete course'),
    });
  };

  return (
    <div>
      <Header
        title="Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? 's' : ''}`}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create Course
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 hover:border-gray-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-white rounded-xl border border-border p-1 shadow-xs">
            {(['all', 'published', 'draft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                  filter === f
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-white rounded-xl border border-border p-1 shadow-xs ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-text-muted hover:text-text-secondary')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-text-muted hover:text-text-secondary')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No courses yet"
            description="Create your first course to start building your learning platform"
            action={
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
                Create Course
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course: Course, i: number) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                menuOpen={menuOpen === course.id}
                onToggleMenu={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                onEdit={() => navigate(`/admin/courses/${course.id}/edit`)}
                onDelete={() => setDeleteConfirm(course.id)}
              />
            ))}
          </div>
        ) : (
          <CourseTable
            courses={courses}
            onEdit={(id) => navigate(`/admin/courses/${id}/edit`)}
            onDelete={(id) => setDeleteConfirm(id)}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Course" size="sm">
        <div className="space-y-4">
          <Input
            label="Course Title"
            placeholder="e.g., Introduction to React"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createCourse.isPending} disabled={!newTitle.trim()}>
              Create Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Course?" size="sm">
        <p className="text-sm text-text-secondary mb-6">
          This action cannot be undone. All lessons, quizzes, and enrollments associated with this course will be removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            loading={deleteCourse.isPending}
          >
            Delete Course
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Course Card ──
function CourseCard({ course, index, menuOpen, onToggleMenu, onEdit, onDelete }: {
  course: Course;
  index: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const publish = useTogglePublish(course.id);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <Card hover onClick={onEdit} className="relative group">
        {/* Cover */}
        <div className="h-36 -m-6 mb-4 bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-50 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
          {course.coverImageUrl ? (
            <img src={course.coverImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="h-10 w-10 text-primary-200" />
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={course.published ? 'success' : 'default'} dot>
              {course.published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          {/* Menu */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
                className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-all"
              >
                <MoreHorizontal className="h-4 w-4 text-text-secondary" />
              </button>
              {menuOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-border/80 py-1.5 w-44 z-10 ring-1 ring-black/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuOption icon={<Edit3 className="h-4 w-4" />} label="Edit" onClick={onEdit} />
                  <MenuOption icon={<Eye className="h-4 w-4" />} label="Preview" onClick={() => window.open(`/courses/${course.slug}`, '_blank')} />
                  <MenuOption
                    icon={<Globe className="h-4 w-4" />}
                    label={course.published ? 'Unpublish' : 'Publish'}
                    onClick={() => publish.mutate(!course.published)}
                  />
                  <MenuOption icon={<Send className="h-4 w-4" />} label="Invite" onClick={onEdit} />
                  <div className="border-t border-border my-1" />
                  <MenuOption icon={<Trash2 className="h-4 w-4" />} label="Delete" onClick={onDelete} danger />
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-text-primary truncate mb-2">{course.title}</h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {course.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] bg-surface-dim text-text-muted px-2 py-0.5 rounded-md font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border">
          <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {course.lessonsCount} lessons</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {Math.round(course.totalDurationSec / 60)}m</span>
        </div>
      </Card>
    </div>
  );
}

function MenuOption({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
        danger ? 'text-danger-500 hover:bg-danger-50' : 'text-text-secondary hover:bg-surface-hover'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Course Table ──
function CourseTable({ courses, onEdit, onDelete }: { courses: Course[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <Card padding={false} className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60 bg-surface-dim/80">
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">Title</th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">Status</th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">Lessons</th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">Duration</th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">Tags</th>
            <th className="px-6 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr
              key={c.id}
              onClick={() => onEdit(c.id)}
              className="border-b border-border/50 last:border-0 hover:bg-primary-50/30 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-text-primary">{c.title}</p>
              </td>
              <td className="px-6 py-4">
                <Badge variant={c.published ? 'success' : 'default'} dot>{c.published ? 'Published' : 'Draft'}</Badge>
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">{c.lessonsCount}</td>
              <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">{Math.round(c.totalDurationSec / 60)}m</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  {c.tags?.slice(0, 2).map((t) => (
                    <span key={t} className="text-[11px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md font-medium ring-1 ring-primary-100">{t}</span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                  className="p-2 rounded-lg text-text-muted hover:text-danger-500 hover:bg-danger-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
