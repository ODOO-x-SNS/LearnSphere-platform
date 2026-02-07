import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Welcome to <span className="text-primary">LearnSphere</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10">
            Your role-based eLearning platform. Discover courses, track progress, and earn badges.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              to="/my-courses"
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              My Courses
            </Link>
            <Link
              to="/admin/courses"
              className="px-6 py-3 text-slate-600 font-medium hover:text-primary transition-colors"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
