import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui';
import {
  BookOpen, Users, TrendingUp, Award, ArrowUpRight,
  BarChart3, Clock,
} from 'lucide-react';
import { useCourses, useCourseProgress } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const statCards = [
  { key: 'courses', label: 'Total Courses', icon: BookOpen, color: 'primary', gradient: 'from-primary-500 to-primary-700' },
  { key: 'learners', label: 'Active Learners', icon: Users, color: 'accent', gradient: 'from-accent-500 to-accent-600' },
  { key: 'completion', label: 'Avg. Completion', icon: TrendingUp, color: 'success', gradient: 'from-success-500 to-success-600' },
  { key: 'quizScore', label: 'Avg. Quiz Score', icon: Award, color: 'warning', gradient: 'from-warning-500 to-orange-500' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: courseData } = useCourses({ limit: 5 });
  const { data: reportData } = useCourseProgress({});

  const courseCount = courseData?.data?.length;
  const hasMoreCourses = !!courseData?.paging?.nextCursor;

  const stats: Record<string, string> = {
    courses: courseCount != null ? (hasMoreCourses ? `${courseCount}+` : String(courseCount)) : '—',
    learners: reportData?.summary?.totalEnrolled?.toString() || '—',
    completion: reportData?.summary?.completionRate != null ? `${Math.round(reportData.summary.completionRate)}%` : '—',
    quizScore: reportData?.summary?.avgQuizScore != null ? `${Math.round(reportData.summary.avgQuizScore)}%` : '—',
  };

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome to your admin overview" />
      <div className="p-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <div
              key={s.key}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Card className="relative overflow-hidden group" hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-text-muted">{s.label}</p>
                    <p className="text-3xl font-bold text-text-primary mt-1 tracking-tight">{stats[s.key]}</p>
                  </div>
                  <div className={clsx('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', s.gradient)}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* subtle accent line at top */}
                <div className={clsx('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity', s.gradient)} />
              </Card>
            </div>
          ))}
        </div>

        {/* Recent courses + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent courses */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  <h3 className="font-semibold text-text-primary text-sm">Recent Courses</h3>
                </div>
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  View all <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-3">
                {courseData?.data?.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors shadow-xs">
                      <BookOpen className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" /> {course.lessonsCount} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {Math.round(course.totalDurationSec / 60)}m
                        </span>
                      </div>
                    </div>
                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      course.published
                        ? 'bg-success-50 text-success-600'
                        : 'bg-gray-100 text-text-muted'
                    )}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                )) || (
                  <div className="py-8 text-center text-text-muted text-sm">
                    No courses yet. Create your first course to get started!
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <h3 className="font-semibold text-text-primary text-sm mb-5">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Create Course', icon: BookOpen, onClick: () => navigate('/admin/courses'), gradient: 'from-primary-500 to-primary-600' },
                { label: 'View Reports', icon: BarChart3, onClick: () => navigate('/admin/reports'), gradient: 'from-accent-500 to-accent-600' },
                { label: 'Manage Users', icon: Users, onClick: () => navigate('/admin/settings'), gradient: 'from-success-500 to-success-600' },
                { label: 'Audit Logs', icon: TrendingUp, onClick: () => navigate('/admin/audit'), gradient: 'from-warning-500 to-orange-500' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-surface-hover transition-all text-left group"
                >
                  <div className={clsx('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', action.gradient)}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[13px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    {action.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
