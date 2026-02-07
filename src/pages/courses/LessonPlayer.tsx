import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const MOCK_COURSE = {
  title: 'Introduction to React',
  lessons: [
    { id: '1', title: 'Getting Started', completed: true },
    { id: '2', title: 'Components & Props', completed: true },
    { id: '3', title: 'State & Hooks', completed: false },
    { id: '4', title: 'Quiz: React Basics', completed: false },
  ],
  progress: 50,
}

export function LessonPlayer() {
  const { courseSlug, lessonId } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentLesson = MOCK_COURSE.lessons.find((l) => l.id === lessonId)
  const currentIndex = MOCK_COURSE.lessons.findIndex((l) => l.id === lessonId)
  const nextLesson = currentIndex >= 0 && currentIndex < MOCK_COURSE.lessons.length - 1
    ? MOCK_COURSE.lessons[currentIndex + 1]
    : null

  return (
    <div className="fixed inset-0 flex bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-slate-800 transition-all overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-slate-700">
          <Link
            to={`/courses/${courseSlug}`}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to course
          </Link>
          <h2 className="font-semibold text-white mt-2">{MOCK_COURSE.title}</h2>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${MOCK_COURSE.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{MOCK_COURSE.progress}% completed</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {MOCK_COURSE.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/courses/${courseSlug}/player/${lesson.id}`}
              className={`block px-3 py-2 rounded-lg text-sm ${
                lesson.id === lessonId
                  ? 'bg-primary/30 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="mr-2">{lesson.completed ? '✓' : '○'}</span>
              {lesson.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-slate-800/50 border-b border-slate-700 flex items-center gap-4 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            ☰
          </button>
          <h1 className="font-medium text-white truncate">
            {currentLesson?.title || 'Lesson'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-xl p-8 text-slate-200">
            <h2 className="text-xl font-semibold text-white mb-4">Lesson Content</h2>
            <p className="text-slate-300 leading-relaxed">
              This is a placeholder for the lesson content. In a full implementation, this would show:
            </p>
            <ul className="list-disc list-inside mt-2 text-slate-300 space-y-1">
              <li>Video player for video lessons</li>
              <li>Document viewer for PDFs</li>
              <li>Image gallery for image lessons</li>
              <li>Quiz interface for quiz lessons</li>
            </ul>
          </div>
        </main>
        <footer className="h-16 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between px-6">
          <Link
            to={`/courses/${courseSlug}`}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </Link>
          {nextLesson ? (
            <Link
              to={`/courses/${courseSlug}/player/${nextLesson.id}`}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark"
            >
              Next Content →
            </Link>
          ) : (
            <Link
              to={`/courses/${courseSlug}`}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark"
            >
              Complete Course
            </Link>
          )}
        </footer>
      </div>
    </div>
  )
}
