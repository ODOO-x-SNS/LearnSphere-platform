import { Outlet, Link } from 'react-router-dom'

const adminNav = [
  { path: '/admin/courses', label: 'Courses' },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/courses" className="text-lg font-bold text-primary">
              LearnSphere Admin
            </Link>
            <nav className="flex gap-6">
              {adminNav.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="text-sm font-medium text-slate-600 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/courses"
                className="text-sm font-medium text-slate-600 hover:text-primary"
              >
                ← Back to Site
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
