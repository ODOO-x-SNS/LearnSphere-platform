import { useState } from "react";
import {
  UserCheck,
  UserX,
  Clock,
  Mail,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button, Badge, Card, EmptyState, toast, ToastContainer } from "../../components/ui";
import {
  useInstructorRequests,
  useApproveInstructor,
  useRejectInstructor,
} from "../../hooks/useApi";

export function InstructorRequestsPage() {
  const { data: requests, isLoading } = useInstructorRequests();
  const approve = useApproveInstructor();
  const reject = useRejectInstructor();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setActionId(id);
    approve.mutate(id, {
      onSuccess: () => {
        toast("success", "Instructor approved successfully");
        setActionId(null);
      },
      onError: () => {
        toast("error", "Failed to approve instructor");
        setActionId(null);
      },
    });
  };

  const handleReject = (id: string) => {
    setActionId(id);
    reject.mutate(id, {
      onSuccess: () => {
        toast("success", "Instructor rejected");
        setActionId(null);
      },
      onError: () => {
        toast("error", "Failed to reject instructor");
        setActionId(null);
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Instructor Requests
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Review and approve instructor signup requests
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        </Card>
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="h-10 w-10" />}
          title="No pending requests"
          description="There are no instructor signup requests to review."
        />
      ) : (
        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-surface-dim/50">
                  <th className="text-left py-3.5 px-5 font-semibold text-text-secondary text-[13px]">
                    Name
                  </th>
                  <th className="text-left py-3.5 px-5 font-semibold text-text-secondary text-[13px]">
                    Email
                  </th>
                  <th className="text-left py-3.5 px-5 font-semibold text-text-secondary text-[13px]">
                    Signup Date
                  </th>
                  <th className="text-left py-3.5 px-5 font-semibold text-text-secondary text-[13px]">
                    Status
                  </th>
                  <th className="text-right py-3.5 px-5 font-semibold text-text-secondary text-[13px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-text-primary">
                      {req.name || "—"}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        {req.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="default" dot>
                        Pending
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          icon={<UserCheck className="h-3.5 w-3.5" />}
                          loading={actionId === req.id && approve.isPending}
                          disabled={actionId === req.id}
                          onClick={() => handleApprove(req.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<UserX className="h-3.5 w-3.5" />}
                          loading={actionId === req.id && reject.isPending}
                          disabled={actionId === req.id}
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ToastContainer />
    </div>
  );
}
