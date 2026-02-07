import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_COURSES = [
  { id: '1', title: 'Introduction to React', tags: ['React'], views: 120, lessons: 8, duration: '2h 30m', published: true },
  { id: '2', title: 'TypeScript Mastery', tags: ['TypeScript'], views: 85, lessons: 12, duration: '4h', published: false },
  { id: '3', title: 'Tailwind CSS Workshop', tags: ['CSS'], views: 45, lessons: 6, duration: '1h 45m', published: true },
]

export function CoursesDashboard() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')

  const filtered = MOCK_COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Courses Dashboard</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Create Course
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search by course name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'kanban' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            List
          </button>
        </div>
      </div>
      {viewMode === 'kanban' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                {course.published && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Published
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-500 space-y-1 mb-4">
                <p>{course.views} views</p>
                <p>{course.lessons} lessons · {course.duration}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/courses/${course.id}/edit`}
                  className="flex-1 py-2 text-center text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5"
                >
                  Edit
                </Link>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Course</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tags</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Views</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Lessons</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{course.title}</td>
                  <td className="py-3 px-4 text-slate-600">{course.tags.join(', ')}</td>
                  <td className="py-3 px-4 text-slate-600">{course.views}</td>
                  <td className="py-3 px-4 text-slate-600">{course.lessons}</td>
                  <td className="py-3 px-4 text-slate-600">{course.duration}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/courses/${course.id}/edit`}
                      className="text-primary font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500">
          {search ? 'No courses match your search.' : 'No courses yet. Create your first course!'}
        </div>
      )}

      {/* Create Course Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Course</h3>
            <input
              type="text"
              placeholder="Course Name (required)"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setNewCourseName('')
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <Link
                to="/admin/courses/new/edit"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark"
              >
                Create
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
