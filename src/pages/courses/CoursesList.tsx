import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_COURSES = [
  { id: '1', title: 'Introduction to React', slug: 'intro-react', description: 'Learn React fundamentals', tags: ['React', 'JavaScript'], image: null, price: null },
  { id: '2', title: 'TypeScript Mastery', slug: 'typescript-mastery', description: 'Deep dive into TypeScript', tags: ['TypeScript'], image: null, price: 49 },
  { id: '3', title: 'Tailwind CSS Workshop', slug: 'tailwind-workshop', description: 'Build beautiful UIs with Tailwind', tags: ['CSS', 'Tailwind'], image: null, price: null },
]

export function CoursesList() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
        <p className="text-slate-600 mt-1">Browse and enroll in courses</p>
      </div>
      <input
        type="search"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg mb-8 focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.slug}`}
            className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl opacity-50">📚</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">{course.title}</h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{course.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-primary font-medium">
                  {course.price ? `$${course.price}` : 'Free'}
                </span>
                <span className="text-sm text-slate-500">Start →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
