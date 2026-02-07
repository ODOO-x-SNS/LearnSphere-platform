import { useState } from 'react';
import {
  BarChart3, Users, TrendingUp, Award, Search,
  Filter, ChevronDown, ArrowUpRight, Clock, BookOpen,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, Badge, Select, TableSkeleton, EmptyState } from '../../components/ui';
import { useCourseProgress, useCourses } from '../../hooks/useApi';
import { clsx } from 'clsx';
import type { ReportRow } from '../../types';

const statusMap: Record<string, { label: string; variant: 'success' | 'primary' | 'default' }> = {
  COMPLETED: { label: 'Completed', variant: 'success' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary' },
  NOT_STARTED: { label: 'Not Started', variant: 'default' },
};

export function ReportsPage() {
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCourseProgress({
    courseId: courseFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: coursesData } = useCourses({ limit: 100 });

  const summary = data?.summary;
  const rows: ReportRow[] = data?.rows || [];
  const filtered = rows.filter((r) =>
    !search || r.userName.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCards = [
    { label: 'Total Enrolled', value: summary?.totalEnrolled ?? '—', icon: Users, gradient: 'from-primary-500 to-primary-600' },
    { label: 'Completion Rate', value: summary?.completionRate != null ? `${Math.round(summary.completionRate)}%` : '—', icon: TrendingUp, gradient: 'from-success-500 to-success-600' },
    { label: 'Avg. Progress', value: summary?.avgProgress != null ? `${Math.round(summary.avgProgress)}%` : '—', icon: BarChart3, gradient: 'from-accent-500 to-accent-600' },
    { label: 'Avg. Quiz Score', value: summary?.avgQuizScore != null ? `${Math.round(summary.avgQuizScore)}%` : '—', icon: Award, gradient: 'from-warning-500 to-orange-500' },
  ];

  return (
    <div>
      <Header
        title="Reports"
        subtitle="Track learner progress and performance"
      />

      <div className="p-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {summaryCards.map((s, i) => (
            <div key={s.label} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-muted">{s.label}</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{s.value}</p>
                  </div>
                  <div className={clsx('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', s.gradient)}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-text-muted flex-shrink-0" />
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search learners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <Select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              options={[
                { value: '', label: 'All Courses' },
                ...(coursesData?.data?.map((c) => ({ value: c.id, label: c.title })) || []),
              ]}
              className="w-52"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'NOT_STARTED', label: 'Not Started' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
              className="w-44"
            />
          </div>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card><TableSkeleton rows={8} cols={6} /></Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-12 w-12" />}
            title="No progress data"
            description="Learner progress will appear here once enrollments begin"
          />
        ) : (
          <Card padding={false} className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-dim">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Learner</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Progress</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Lessons</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Quiz Score</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const s = statusMap[row.status] || statusMap.NOT_STARTED;
                  return (
                    <tr key={row.userId} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {row.userName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{row.userName}</p>
                            <p className="text-xs text-text-muted">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                row.progress >= 100 ? 'bg-success-500' :
                                row.progress >= 50 ? 'bg-primary-500' :
                                'bg-warning-500'
                              )}
                              style={{ width: `${Math.min(row.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-text-secondary tabular-nums">{Math.round(row.progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {row.completedLessons}/{row.totalLessons}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {row.quizScore != null ? `${Math.round(row.quizScore)}%` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock className="h-3 w-3" />
                          {new Date(row.lastActivity).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
