import { useMemo, useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";
import { Header } from "../../components/layout/Header";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  CardSkeleton,
  TableSkeleton,
  Textarea,
} from "../../components/ui";
import { toast } from "../../components/ui/Toast";
import {
  useApproveCourseRequest,
  useCourseRequest,
  useCourseRequests,
  useCourseRequestStats,
  useRejectCourseRequest,
} from "../../hooks/useApi";
import { clsx } from "clsx";
import type { CourseRequest, CourseRequestStatus } from "../../types";

type ViewMode = "grid" | "list";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const statusLabels: Record<CourseRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusBadge: Record<
  CourseRequestStatus,
  "warning" | "success" | "danger"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export function CourseRequestsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);

  const statusParam = filter === "all" ? undefined : filter.toUpperCase();
  const { data, isLoading, refetch } = useCourseRequests({
    status: statusParam,
    take: 50,
  });
  const { data: stats, refetch: refetchStats } = useCourseRequestStats();

  const requests = data?.data || [];
  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const term = search.toLowerCase();
    return requests.filter((request) => {
      const courseTitle = request.course.title.toLowerCase();
      const instructorName = request.instructor.name?.toLowerCase() || "";
      const instructorEmail = request.instructor.email?.toLowerCase() || "";
      return (
        courseTitle.includes(term) ||
        instructorName.includes(term) ||
        instructorEmail.includes(term)
      );
    });
  }, [requests, search]);

  const selectedRequest = useCourseRequest(selectedId || "", !!selectedId);
  const approveRequest = useApproveCourseRequest();
  const rejectRequest = useRejectCourseRequest();

  const handleCloseModal = () => {
    setSelectedId(null);
    setRejectReason("");
    setRejectMode(false);
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    approveRequest.mutate(selectedId, {
      onSuccess: () => {
        toast("success", "Course request approved");
        // Explicitly refetch to update the list and stats
        refetch();
        refetchStats();
        handleCloseModal();
      },
      onError: () => toast("error", "Failed to approve request"),
    });
  };

  const handleReject = async () => {
    if (!selectedId) return;
    if (!rejectReason.trim()) {
      toast("error", "Please provide a rejection reason");
      return;
    }
    rejectRequest.mutate(
      { id: selectedId, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          toast("success", "Course request rejected");
          // Explicitly refetch to update the list and stats
          refetch();
          refetchStats();
          handleCloseModal();
        },
        onError: () => toast("error", "Failed to reject request"),
      },
    );
  };

  const subtitle = stats
    ? `${stats.pending} pending · ${stats.approved} approved · ${stats.rejected} rejected`
    : "Review instructor course submissions";

  return (
    <div>
      <Header title="Course Requests" subtitle={subtitle} />

      <div className="p-8 space-y-6">
        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by course or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 hover:border-gray-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-white rounded-xl border border-border p-1 shadow-xs">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (state) => (
                <button
                  key={state}
                  onClick={() => setFilter(state)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                    filter === state
                      ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100"
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-hover",
                  )}
                >
                  {state}
                </button>
              ),
            )}
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
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Card>
              <TableSkeleton rows={6} cols={5} />
            </Card>
          )
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-12 w-12" />}
            title="No course requests"
            description="Instructor submissions will appear here for review"
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRequests.map((request, i) => (
              <CourseRequestCard
                key={request.id}
                request={request}
                index={i}
                onOpen={() => setSelectedId(request.id)}
              />
            ))}
          </div>
        ) : (
          <CourseRequestTable
            requests={filteredRequests}
            onOpen={(id) => setSelectedId(id)}
          />
        )}
      </div>

      <Modal
        open={!!selectedId}
        onClose={handleCloseModal}
        title="Course Request Details"
        size="lg"
      >
        {selectedRequest.isLoading ? (
          <div className="py-8 text-center text-text-muted">
            Loading request details...
          </div>
        ) : selectedRequest.data ? (
          <CourseRequestDetails
            request={selectedRequest.data}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            rejectMode={rejectMode}
            setRejectMode={setRejectMode}
            onApprove={handleApprove}
            onReject={handleReject}
            approveLoading={approveRequest.isPending}
            rejectLoading={rejectRequest.isPending}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function CourseRequestCard({
  request,
  index,
  onOpen,
}: {
  request: CourseRequest;
  index: number;
  onOpen: () => void;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card hover onClick={onOpen} className="relative">
        <div className="h-32 -m-6 mb-4 bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-50 rounded-t-2xl overflow-hidden flex items-center justify-center">
          {request.course.coverImage?.url ? (
            <img
              src={request.course.coverImage.url}
              alt={request.course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-primary-200" />
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={statusBadge[request.status]} dot>
              {statusLabels[request.status]}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-text-primary truncate mb-1">
          {request.course.title}
        </h3>
        <p className="text-xs text-text-muted mb-3">
          {request.instructor.name} · {request.instructor.email}
        </p>

        {request.course.tags && request.course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {request.course.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="default">
                {tag}
              </Badge>
            ))}
            {request.course.tags.length > 3 && (
              <Badge variant="default">+{request.course.tags.length - 3}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {request.course._count.lessons}{" "}
            lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {request.course._count.quizzes}{" "}
            quizzes
          </span>
        </div>
      </Card>
    </div>
  );
}

function CourseRequestTable({
  requests,
  onOpen,
}: {
  requests: CourseRequest[];
  onOpen: (id: string) => void;
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60 bg-surface-dim/80">
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Course
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Instructor
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Status
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Content
            </th>
            <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3.5">
              Submitted
            </th>
            <th className="px-6 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              onClick={() => onOpen(request.id)}
              className="border-b border-border/50 last:border-0 hover:bg-primary-50/30 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-text-primary mb-2">
                  {request.course.title}
                </p>
                {request.course.tags && request.course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {request.course.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="default">
                        {tag}
                      </Badge>
                    ))}
                    {request.course.tags.length > 2 && (
                      <Badge variant="default">
                        +{request.course.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-text-secondary">
                  {request.instructor.name}
                </p>
                <p className="text-xs text-text-muted">
                  {request.instructor.email}
                </p>
              </td>
              <td className="px-6 py-4">
                <Badge variant={statusBadge[request.status]} dot>
                  {statusLabels[request.status]}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary">
                {request.course._count.lessons} lessons ·{" "}
                {request.course._count.quizzes} quizzes
              </td>
              <td className="px-6 py-4 text-sm text-text-secondary">
                {new Date(request.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-right text-xs text-text-muted">
                View
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function CourseRequestDetails({
  request,
  rejectReason,
  setRejectReason,
  rejectMode,
  setRejectMode,
  onApprove,
  onReject,
  approveLoading,
  rejectLoading,
}: {
  request: CourseRequest;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  rejectMode: boolean;
  setRejectMode: (value: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  approveLoading: boolean;
  rejectLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 pb-6 border-b border-border">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {request.course.coverImage?.url ? (
            <img
              src={request.course.coverImage.url}
              alt={request.course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-7 w-7 text-primary-400" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-text-primary">
              {request.course.title}
            </h3>
            <Badge variant={statusBadge[request.status]} dot>
              {statusLabels[request.status]}
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Instructor: {request.instructor.name} · {request.instructor.email}
          </p>
          {request.course.description && (
            <p className="text-sm text-text-secondary mt-2">
              {request.course.description}
            </p>
          )}
          {request.id.startsWith("draft_") && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
              💡 This is an instructor draft course. It will be published upon
              approval.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox
          icon={<BookOpen className="h-5 w-5" />}
          label="Lessons"
          value={request.course._count.lessons}
        />
        <StatBox
          icon={<Users className="h-5 w-5" />}
          label="Quizzes"
          value={request.course._count.quizzes}
        />
        <StatBox
          icon={<Clock className="h-5 w-5" />}
          label="Submitted"
          value={new Date(request.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        />
      </div>

      {request.course.tags && request.course.tags.length > 0 && (
        <div>
          <h4 className="font-semibold text-text-primary mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {request.course.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium ring-1 ring-primary-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {request.status === "PENDING" && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" /> Submitted{" "}
            {new Date(request.createdAt).toLocaleString()}
          </div>
          <div className="flex gap-2">
            {!request.id.startsWith("draft_") && (
              <Button
                variant="secondary"
                onClick={() => setRejectMode(true)}
                icon={<XCircle className="h-4 w-4" />}
              >
                Reject
              </Button>
            )}
            <Button
              onClick={onApprove}
              loading={approveLoading}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      )}

      {rejectMode && (
        <div className="pt-4 border-t border-border space-y-4">
          <Textarea
            label="Rejection reason"
            placeholder="Explain why this request was rejected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectMode(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onReject} loading={rejectLoading}>
              Reject Request
            </Button>
          </div>
        </div>
      )}

      {request.status !== "PENDING" && (
        <div className="pt-4 border-t border-border text-sm text-text-muted">
          {request.status === "APPROVED" ? (
            <div className="flex items-center gap-2 text-success-600">
              <CheckCircle2 className="h-4 w-4" /> Approved on{" "}
              {request.reviewedAt
                ? new Date(request.reviewedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-danger-600">
                <XCircle className="h-4 w-4" /> Rejected on{" "}
                {request.reviewedAt
                  ? new Date(request.reviewedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
              {request.rejectionReason && (
                <div className="text-sm text-text-secondary bg-danger-50/60 border border-danger-100 rounded-xl p-3">
                  {request.rejectionReason}
                </div>
              )}
            </div>
          )}
        </div>
      )}
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
