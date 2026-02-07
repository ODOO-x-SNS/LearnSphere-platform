import { Link } from 'react-router-dom'

const BADGES = [
  { name: 'Newbie', threshold: 20 },
  { name: 'Explorer', threshold: 40 },
  { name: 'Achiever', threshold: 60 },
  { name: 'Specialist', threshold: 80 },
  { name: 'Expert', threshold: 100 },
  { name: 'Master', threshold: 120 },
]

const MOCK_MY_COURSES = [
  { id: '1', title: 'Introduction to React', slug: 'intro-react', progress: 45, status: 'in_progress' as const, cta: 'Continue' },
  { id: '2', title: 'TypeScript Mastery', slug: 'typescript-mastery', progress: 0, status: 'enrolled' as const, cta: 'Start' },
]

export function MyCourses() {
  const totalPoints = 35
  const currentBadge = BADGES.find((b) => totalPoints < b.threshold) || BADGES[BADGES.length - 1]
  const badgeIndex = BADGES.indexOf(currentBadge)
  const nextBadge = BADGES[badgeIndex + 1]
  const progressToNext = nextBadge
    ? ((totalPoints - currentBadge.threshold) / (nextBadge.threshold - currentBadge.threshold)) * 100
    : 100

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-600 mt-1 mb-6">Your learning progress</p>
          <div className="space-y-4">
            {MOCK_MY_COURSES.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg">
                  {course.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4">Profile</h3>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-2">
                {totalPoints}
              </div>
              <p className="font-medium text-slate-900">{currentBadge.name}</p>
              <p className="text-sm text-slate-500">{totalPoints} points</p>
            </div>
            {nextBadge && (
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  {nextBadge.threshold - totalPoints} pts to {nextBadge.name}
                </p>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
