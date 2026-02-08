import { useState } from 'react';
import {
  BarChart3, Users, TrendingUp, Award, Search,
  Filter, Clock, Star, MessageSquare,
  ChevronRight, ChevronDown, BookOpen, Trophy,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, Badge, Select, TableSkeleton, EmptyState } from '../../components/ui';
import { useCourseProgress, useCourses, useLearners, useAllReviews } from '../../hooks/useApi';
import { clsx } from 'clsx';
import type { ReportRow, LearnerDetail, Review } from '../../types';

const statusMap: Record<string, { label: string; variant: 'success' | 'primary' | 'default' }> = {
  COMPLETED: { label: 'Completed', variant: 'success' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary' },
  NOT_STARTED: { label: 'Not Started', variant: 'default' },
  YET_TO_START: { label: 'Not Started', variant: 'default' },
};

type TabKey = 'progress' | 'learners' | 'reviews';

export function ReportsPage() {
  const [tab, setTab] = useState<TabKey>('progress');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedLearner, setExpandedLearner] = useState<string | null>(null);

  const { data: coursesData } = useCourses({ limit: 100 });

  const { data: progressData, isLoading: progressLoading } = useCourseProgress({
    courseId: courseFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const { data: learnersData, isLoading: learnersLoading } = useLearners({
    search: search || undefined,
  });
  const { data: reviewsData, isLoading: reviewsLoading } = useAllReviews();

  const summary = progressData?.summary;
  const rows: ReportRow[] = progressData?.rows || [];
  const learners: LearnerDetail[] = learnersData || [];
  const reviews: Review[] = reviewsData || [];

  const summaryCards = [
    { label: 'Total Enrolled', value: summary?.totalEnrolled ?? '—', icon: Users, gradient: 'from-primary-500 to-primary-600' },
    { label: 'Completion Rate', value: summary?.completionRate != null ? `${Math.round(summary.completionRate)}%` : '—', icon: TrendingUp, gradient: 'from-success-500 to-success-600' },
    { label: 'Avg. Progress', value: summary?.avgProgress != null ? `${Math.round(summary.avgProgress)}%` : '—', icon: BarChart3, gradient: 'from-accent-500 to-accent-600' },
    { label: 'Avg. Quiz Score', value: summary?.avgQuizScore != null ? `${Math.round(summary.avgQuizScore)}%` : '—', icon: Award, gradient: 'from-warning-500 to-orange-500' },
  ];

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'progress', label: 'Progress', icon: BarChart3 },
    { key: 'learners', label: 'Learners', icon: Users },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  return (
    <div>
      <Header title="Reports" subtitle="Track learner progress, reviews, and performance" />

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

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-dim rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(''); }}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                tab === t.key
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.key === 'reviews' && reviews.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-semibold">
                  {reviews.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════ PROGRESS TAB ═══════════ */}
        {tab === 'progress' && (
          <>
            <Card>
              <div className="flex items-center gap-4 flex-wrap">
                <Filter className="h-4 w-4 text-text-muted flex-shrink-0" />
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input type="text" placeholder="Search learners..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
                  options={[{ value: '', label: 'All Courses' }, ...(coursesData?.data?.map((c) => ({ value: c.id, label: c.title })) || [])]} className="w-52" />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  options={[{ value: '', label: 'All Statuses' }, { value: 'YET_TO_START', label: 'Not Started' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'COMPLETED', label: 'Completed' }]} className="w-44" />
              </div>
            </Card>

            {progressLoading ? (
              <Card><TableSkeleton rows={8} cols={7} /></Card>
            ) : rows.length === 0 ? (
              <EmptyState icon={<BarChart3 className="h-12 w-12" />} title="No progress data" description="Learner progress will appear here once enrollments begin" />
            ) : (
              <Card padding={false} className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface-dim">
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Learner</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Course</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Progress</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Lessons</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Quiz Score</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const s = statusMap[row.status] || statusMap.NOT_STARTED;
                      return (
                        <tr key={row.enrollmentId} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
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
                            <p className="text-sm text-text-secondary truncate max-w-[180px]">{row.courseTitle}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                                <div className={clsx('h-full rounded-full transition-all',
                                  row.progress >= 100 ? 'bg-success-500' : row.progress >= 50 ? 'bg-primary-500' : 'bg-warning-500')}
                                  style={{ width: `${Math.min(row.progress, 100)}%` }} />
                              </div>
                              <span className="text-sm font-medium text-text-secondary tabular-nums">{Math.round(row.progress)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{row.completedLessons}/{row.totalLessons}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{row.quizScore != null ? `${Math.round(row.quizScore)}%` : '—'}</td>
                          <td className="px-6 py-4"><Badge variant={s.variant}>{s.label}</Badge></td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock className="h-3 w-3" />
                              {new Date(row.enrolledAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}

        {/* ═══════════ LEARNERS TAB ═══════════ */}
        {tab === 'learners' && (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-text-muted flex-shrink-0" />
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input type="text" placeholder="Search learners by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              </div>
            </Card>

            {learnersLoading ? (
              <Card><TableSkeleton rows={6} cols={6} /></Card>
            ) : learners.length === 0 ? (
              <EmptyState icon={<Users className="h-12 w-12" />} title="No learners yet" description="Learner details will appear here once users register" />
            ) : (
              <div className="space-y-3">
                {learners.map((learner) => {
                  const isExpanded = expandedLearner === learner.id;
                  return (
                    <Card key={learner.id} padding={false} className="overflow-hidden">
                      <button onClick={() => setExpandedLearner(isExpanded ? null : learner.id)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-hover transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {(learner.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{learner.name}</p>
                          <p className="text-xs text-text-muted">{learner.email}</p>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-center">
                            <p className="text-xs text-text-muted">Courses</p>
                            <p className="text-sm font-bold text-text-primary">{learner.completedCourses}/{learner.totalCourses}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-text-muted">Points</p>
                            <p className="text-sm font-bold text-primary-600">{learner.totalPoints}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-text-muted">Badges</p>
                            <p className="text-sm font-bold text-text-primary">{learner.badgeCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-text-muted">Quiz Avg</p>
                            <p className="text-sm font-bold text-text-primary">{learner.avgQuizScore != null ? `${learner.avgQuizScore}%` : '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-text-muted">Joined</p>
                            <p className="text-xs text-text-secondary">{new Date(learner.joinedAt).toLocaleDateString()}</p>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border px-6 py-5 bg-surface-dim/50 space-y-5">
                          {learner.badges.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Trophy className="h-3.5 w-3.5" />Badges Earned
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {learner.badges.map((b, i) => (
                                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-border text-xs font-medium text-text-secondary">
                                    <span>{b.icon || '🏅'}</span>{b.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {learner.enrollments.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />Enrolled Courses
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {learner.enrollments.map((e) => {
                                  const es = statusMap[e.status] || statusMap.NOT_STARTED;
                                  return (
                                    <div key={e.courseId} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-border">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-text-primary truncate">{e.courseTitle}</p>
                                        <p className="text-xs text-text-muted">{e.lessonsCompleted} lessons • Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
                                      </div>
                                      <Badge variant={es.variant}>{es.label}</Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {learner.reviews.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />Reviews Given
                              </h4>
                              <div className="space-y-2">
                                {learner.reviews.map((r) => (
                                  <div key={r.id} className="bg-white rounded-lg px-4 py-3 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-text-primary">{r.courseTitle}</span>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} className={clsx('h-3 w-3', s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                                        ))}
                                      </div>
                                      <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {r.text && <p className="text-sm text-text-secondary">{r.text}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {learner.enrollments.length === 0 && learner.badges.length === 0 && learner.reviews.length === 0 && (
                            <p className="text-sm text-text-muted italic">No activity data available for this learner.</p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══════════ REVIEWS TAB ═══════════ */}
        {tab === 'reviews' && (
          <>
            {reviewsLoading ? (
              <Card><TableSkeleton rows={6} cols={5} /></Card>
            ) : reviews.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No reviews yet" description="Course reviews from learners will appear here" />
            ) : (
              <Card padding={false} className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface-dim">
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Learner</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Course</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Rating</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Review</th>
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {(review.user?.name || review.user?.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{review.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-text-muted">{review.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary truncate max-w-[200px]">{review.course?.title || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={clsx('h-4 w-4', s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary line-clamp-2 max-w-[300px]">
                            {review.text || <span className="italic text-text-muted">No comment</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
