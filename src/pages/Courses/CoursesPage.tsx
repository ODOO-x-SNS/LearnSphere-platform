import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  BookOpen,
  Clock,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Globe,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
import { Header } from "../../components/layout/Header";
import {
  Button,
  Card,
  Badge,
  Modal,
  Input,
  EmptyState,
  CardSkeleton,
} from "../../components/ui";
import { toast } from "../../components/ui/Toast";
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useTogglePublish,
  useSubmitCourseRequest,
} from "../../hooks/useApi";
import { uploadFile } from "../../lib/upload";
import { useAuthStore } from "../../store/auth";
import { clsx } from "clsx";
import type { Course } from "../../types";

type ViewMode = "grid" | "list";

export function CoursesPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useCourses({
    search: search || undefined,
    limit: 50,
  });
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();

  const courses =
    data?.data?.filter((c: Course) => {
      if (filter === "published") return c.published;
      if (filter === "draft") return !c.published;
      return true;
    }) || [];

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast("error", "Please enter a course title");
      return;
    }
    if (!coverImageId) {
      toast("error", "Please upload a cover image");
      return;
    }
    createCourse.mutate(
      {
        title: newTitle.trim(),
        coverImageId,
        tags: newTags.length > 0 ? newTags : undefined,
      },
      {
        onSuccess: (course) => {
          setCreateOpen(false);
          setNewTitle("");
          setNewTags([]);
          setTagInput("");
          setCoverImageId(null);
          setCoverImagePreview(null);
          toast("success", "Course created!");
          navigate(`/admin/courses/${course.id}/edit`);
        },
        onError: () => toast("error", "Failed to create course"),
      },
    );
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
      setTagInput("");
    }
  };

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      toast("error", "Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("error", "Image must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file to backend
    setIsUploading(true);
    try {
      const uploadedFile = await uploadFile(file);
      setCoverImageId(uploadedFile.id);
      toast("success", "Cover image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast(
        "error",
        error instanceof Error ? error.message : "Failed to upload image",
      );
      setCoverImagePreview(null);
      setCoverImageId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((tag) => tag !== tagToRemove));
  };

  const handleDelete = (id: string) => {
    deleteCourse.mutate(id, {
      onSuccess: () => {
        toast("success", "Course deleted");
        setDeleteConfirm(null);
        setMenuOpen(null);
      },
      onError: () => toast("error", "Failed to delete course"),
    });
  };

  return (
    <div>
      <Header
        title="Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""}`}
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateOpen(true)}
          >
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
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                  filter === f
                    ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-hover",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-white rounded-xl border border-border p-1 shadow-xs ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-primary-50 text-primary-600 shadow-sm"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-primary-50 text-primary-600 shadow-sm"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No courses yet"
            description="Create your first course to start building your learning platform"
            action={
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setCreateOpen(true)}
              >
                Create Course
              </Button>
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course: Course, i: number) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                menuOpen={menuOpen === course.id}
                onToggleMenu={() =>
                  setMenuOpen(menuOpen === course.id ? null : course.id)
                }
                onEdit={() => navigate(`/admin/courses/${course.id}/edit`)}
                onDelete={() => {
                  setMenuOpen(null);
                  setDeleteConfirm(course.id);
                }}
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
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setNewTitle("");
          setNewTags([]);
          setTagInput("");
          setCoverImageId(null);
          setCoverImagePreview(null);
          setIsUploading(false);
        }}
        title="Create New Course"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Course Title"
            placeholder="e.g., Introduction to React"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Cover Image <span className="text-danger-500">*</span>
            </label>
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              {coverImagePreview ? (
                <div className="relative">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="max-h-40 mx-auto rounded"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverImagePreview(null);
                      setCoverImageId(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 bg-danger-500 text-white rounded-full p-1 hover:bg-danger-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : isUploading ? (
                <div>
                  <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-text-primary font-medium">
                    Uploading...
                  </p>
                </div>
              ) : (
                <div>
                  <BookOpen className="h-10 w-10 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-primary font-medium">
                    Click to upload cover image
                  </p>
                  <p className="text-xs text-text-muted">
                    PNG, JPG or GIF (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                placeholder="Add a tag and press Enter"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {newTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {newTags.map((tag) => (
                  <div
                    key={tag}
                    className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium ring-1 ring-primary-100 flex items-center gap-1.5"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setNewTitle("");
                setNewTags([]);
                setTagInput("");
                setCoverImageId(null);
                setCoverImagePreview(null);
                setIsUploading(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={createCourse.isPending}
              disabled={!newTitle.trim() || !coverImageId || isUploading}
            >
              Create Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Course?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6">
          This action cannot be undone. All lessons, quizzes, and enrollments
          associated with this course will be removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
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
function CourseCard({
  course,
  index,
  menuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
}: {
  course: Course;
  index: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const publish = useTogglePublish(course.id);
  const submitRequest = useSubmitCourseRequest();
  const user = useAuthStore((s) => s.user);
  const isInstructor = user?.role === "INSTRUCTOR";
  const isAdmin = user?.role === "ADMIN";
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggleMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, onToggleMenu]);

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card hover onClick={onEdit} className="relative group">
        {/* Cover */}
        <div className="h-36 -m-6 mb-4 bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-50 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
          {course.coverImage?.url ? (
            <img
              src={course.coverImage.url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-10 w-10 text-primary-200" />
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={course.published ? "success" : "default"} dot>
              {course.published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        {/* Menu – positioned outside overflow-hidden cover so dropdown is not clipped */}
        <div
          ref={menuRef}
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-30"
        >
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
              className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-all"
            >
              <MoreHorizontal className="h-4 w-4 text-text-secondary" />
            </button>
            {menuOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-border/80 py-1.5 w-44 z-50 ring-1 ring-black/5"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuOption
                  icon={<Edit3 className="h-4 w-4" />}
                  label="Edit"
                  onClick={onEdit}
                />
                <MenuOption
                  icon={<Eye className="h-4 w-4" />}
                  label="Preview"
                  onClick={() =>
                    window.open(`/courses/${course.slug}`, "_blank")
                  }
                />
                {isAdmin && (
                  <MenuOption
                    icon={<Globe className="h-4 w-4" />}
                    label={course.published ? "Unpublish" : "Publish"}
                    onClick={() => publish.mutate(!course.published)}
                  />
                )}
                <MenuOption
                  icon={<Send className="h-4 w-4" />}
                  label="Invite"
                  onClick={onEdit}
                />
                {isInstructor && !course.published && (
                  <MenuOption
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Submit for approval"
                    onClick={() => {
                      submitRequest.mutate(course.id, {
                        onSuccess: () => {
                          toast("success", "Course submitted for approval");
                          onToggleMenu();
                        },
                        onError: () =>
                          toast("error", "Failed to submit course"),
                      });
                    }}
                  />
                )}
                <div className="border-t border-border my-1" />
                <MenuOption
                  icon={<Trash2 className="h-4 w-4" />}
                  label="Delete"
                  onClick={onDelete}
                  danger
                />
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-text-primary truncate mb-2">
          {course.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {course.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] bg-surface-dim text-text-muted px-2 py-0.5 rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> {course.lessonsCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />{" "}
            {formatDuration(course.totalDurationSec)}
          </span>
        </div>
      </Card>
    </div>
  );
}

function MenuOption({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors",
        danger
          ? "text-danger-500 hover:bg-danger-50"
          : "text-text-secondary hover:bg-surface-hover",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Course Table ──
function CourseTable({
  courses,
  onEdit,
  onDelete,
}: {
  courses: Course[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60 bg-surface-dim/80">
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Title
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Status
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Lessons
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Duration
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Tags
            </th>
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
                <p className="text-sm font-semibold text-text-primary">
                  {c.title}
                </p>
              </td>
              <td className="px-6 py-4">
                <Badge variant={c.published ? "success" : "default"} dot>
                  {c.published ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                {c.lessonsCount}
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                {formatDuration(c.totalDurationSec)}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  {c.tags?.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[11px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md font-medium ring-1 ring-primary-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
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
