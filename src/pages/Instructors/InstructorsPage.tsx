import { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Trash2,
  Users,
  Mail,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Header } from "../../components/layout/Header";
import {
  Button,
  Card,
  Badge,
  Modal,
  EmptyState,
  CardSkeleton,
} from "../../components/ui";
import { toast } from "../../components/ui/Toast";
import { useInstructors, useInstructorDetails } from "../../hooks/useApi";
import { clsx } from "clsx";

type ViewMode = "grid" | "list";

interface Instructor {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  totalPoints: number;
  createdAt: string;
}

interface InstructorWithDetails extends Instructor {
  coursesCount: number;
  studentCount: number;
  courses: Array<{
    id: string;
    title: string;
    published: boolean;
    createdAt: string;
  }>;
}

export function InstructorsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorWithDetails | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data, isLoading } = useInstructors({ search: search || undefined });
  const detailsQuery = useInstructorDetails(
    selectedInstructor?.id || "",
    detailsOpen,
  );

  const instructors = data?.data || [];

  const handleViewDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor as InstructorWithDetails);
    setDetailsOpen(true);
    setMenuOpen(null);
  };

  return (
    <div>
      <Header
        title="Instructors"
        subtitle={`${instructors.length} instructor${instructors.length !== 1 ? "s" : ""}`}
      />

      <div className="p-8 space-y-6">
        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 hover:border-gray-300 transition-all"
            />
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
        ) : instructors.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No instructors yet"
            description="Instructors will appear here once they join the platform"
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {instructors.map((instructor: Instructor, i: number) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                index={i}
                menuOpen={menuOpen === instructor.id}
                onToggleMenu={() =>
                  setMenuOpen(menuOpen === instructor.id ? null : instructor.id)
                }
                onViewDetails={() => handleViewDetails(instructor)}
              />
            ))}
          </div>
        ) : (
          <InstructorTable
            instructors={instructors}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Details Modal */}
      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Instructor Details"
        size="lg"
      >
        {detailsQuery.isLoading ? (
          <div className="py-8 text-center text-text-muted">
            Loading instructor details...
          </div>
        ) : detailsQuery.data ? (
          <InstructorDetailsContent instructor={detailsQuery.data} />
        ) : null}
      </Modal>
    </div>
  );
}

// ── Instructor Card ──
function InstructorCard({
  instructor,
  index,
  menuOpen,
  onToggleMenu,
  onViewDetails,
}: {
  instructor: Instructor;
  index: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onViewDetails: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

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
      <Card hover className="relative group">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mx-auto overflow-hidden">
            {instructor.avatarUrl ? (
              <img
                src={instructor.avatarUrl}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="h-8 w-8 text-primary-400" />
            )}
          </div>
        </div>

        {/* Menu */}
        <div
          ref={menuRef}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-30"
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
                className="absolute top-full right-0 mt-1 bg-white rounded-2xl shadow-xl border border-border/80 py-1.5 w-40 z-50 ring-1 ring-black/5"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuOption
                  icon={<Eye className="h-4 w-4" />}
                  label="View Details"
                  onClick={onViewDetails}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-text-primary text-center truncate mb-1">
          {instructor.name}
        </h3>
        <p className="text-xs text-text-muted text-center mb-4 truncate">
          {instructor.email}
        </p>

        {instructor.bio && (
          <p className="text-xs text-text-secondary text-center mb-4 line-clamp-2">
            {instructor.bio}
          </p>
        )}

        {/* Points */}
        <div className="text-xs text-text-muted text-center mb-4 pb-4 border-b border-border">
          <span className="font-semibold text-primary-600">
            {instructor.totalPoints}
          </span>{" "}
          Total Points
        </div>

        {/* Joined date */}
        <p className="text-xs text-text-muted text-center">
          Joined{" "}
          {new Date(instructor.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </p>
      </Card>
    </div>
  );
}

function MenuOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

// ── Instructor Table ──
function InstructorTable({
  instructors,
  onViewDetails,
}: {
  instructors: Instructor[];
  onViewDetails: (instructor: Instructor) => void;
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60 bg-surface-dim/80">
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Name
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Email
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Bio
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Points
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Joined
            </th>
            <th className="px-6 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr
              key={instructor.id}
              className="border-b border-border/50 last:border-0 hover:bg-primary-50/30 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-text-primary">
                  {instructor.name}
                </p>
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary">
                {instructor.email}
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary line-clamp-1">
                {instructor.bio || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary tabular-nums">
                {instructor.totalPoints}
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary">
                {new Date(instructor.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(instructor);
                  }}
                  className="p-2 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── Instructor Details ──
function InstructorDetailsContent({
  instructor,
}: {
  instructor: InstructorWithDetails;
}) {
  return (
    <div className="space-y-6">
      {/* Header with avatar */}
      <div className="flex gap-4 pb-6 border-b border-border">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {instructor.avatarUrl ? (
            <img
              src={instructor.avatarUrl}
              alt={instructor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="h-8 w-8 text-primary-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {instructor.name}
          </h3>
          <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
            <Mail className="h-3.5 w-3.5" /> {instructor.email}
          </p>
          {instructor.bio && (
            <p className="text-sm text-text-secondary mt-2">{instructor.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox
          icon={<BookOpen className="h-5 w-5" />}
          label="Courses"
          value={instructor.coursesCount}
        />
        <StatBox
          icon={<GraduationCap className="h-5 w-5" />}
          label="Students"
          value={instructor.studentCount}
        />
        <StatBox
          icon={<span className="text-xs font-bold">⭐</span>}
          label="Points"
          value={instructor.totalPoints}
        />
      </div>

      {/* Courses */}
      {instructor.courses.length > 0 && (
        <div>
          <h4 className="font-semibold text-text-primary mb-3">
            Courses ({instructor.courses.length})
          </h4>
          <div className="space-y-2">
            {instructor.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 bg-surface-dim rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {course.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(course.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant={course.published ? "success" : "default"}
                  dot
                  size="sm"
                >
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="pt-4 border-t border-border text-xs text-text-muted space-y-1">
        <p>
          Joined{" "}
          {new Date(instructor.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {instructor.updatedAt && (
          <p>
            Last updated{" "}
            {new Date(instructor.updatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-3 bg-surface-dim rounded-lg text-center">
      <div className="flex justify-center mb-2 text-primary-600">{icon}</div>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
