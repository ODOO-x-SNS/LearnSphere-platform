import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const MOCK_COURSE = {
  title: 'Introduction to React',
  slug: 'intro-react',
  description: 'Learn React fundamentals from scratch. Build modern web applications with hooks, state management, and best practices.',
  lessons: [
    { id: '1', title: 'Getting Started', type: 'video' as const, completed: true },
    { id: '2', title: 'Components & Props', type: 'video' as const, completed: true },
    { id: '3', title: 'State & Hooks', type: 'document' as const, completed: false },
    { id: '4', title: 'Quiz: React Basics', type: 'quiz' as const, completed: false },
  ],
  progress: 50,
  completedCount: 2,
  totalLessons: 4,
}

export function CourseDetail() {
  const { courseSlug } = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [lessonSearch, setLessonSearch] = useState('')

  const filteredLessons = MOCK_COURSE.lessons.filter((l) =>
    l.title.toLowerCase().includes(lessonSearch.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl opacity-50">📚</span>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-900">{MOCK_COURSE.title}</h1>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${MOCK_COURSE.progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {MOCK_COURSE.completedCount} / {MOCK_COURSE.totalLessons} lessons completed
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex gap-4 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 font-medium ${
                  activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-slate-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 font-medium ${
                  activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-slate-600'
                }`}
              >
                Ratings & Reviews
              </button>
            </div>
            {activeTab === 'overview' && (
              <div className="mt-6">
                <p className="text-slate-600">{MOCK_COURSE.description}</p>
                <input
                  type="search"
                  placeholder="Search lessons..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  className="mt-4 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="mt-4 space-y-2">
                  {filteredLessons.map((lesson, i) => (
                    <Link
                      key={lesson.id}
                      to={`/courses/${courseSlug}/player/${lesson.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-slate-400 w-6">
                        {lesson.completed ? '✓' : i + 1}
                      </span>
                      <span className="text-slate-500 text-sm">{lesson.type}</span>
                      <span className="flex-1 font-medium">{lesson.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="mt-6">
                <p className="text-slate-600">Ratings & reviews coming soon.</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <Link
              to={`/courses/${courseSlug}/player/${MOCK_COURSE.lessons[0].id}`}
              className="block w-full py-3 bg-primary text-white text-center font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
