import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LearnerLayout } from './components/layout/LearnerLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { Home } from './pages/Home'
import { CoursesList } from './pages/courses/CoursesList'
import { MyCourses } from './pages/courses/MyCourses'
import { CourseDetail } from './pages/courses/CourseDetail'
import { LessonPlayer } from './pages/courses/LessonPlayer'
import { CoursesDashboard } from './pages/admin/CoursesDashboard'
import { CourseForm } from './pages/admin/CourseForm'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/courses" replace />} />
            <Route path="courses" element={<CoursesDashboard />} />
            <Route path="courses/:courseId/edit" element={<CourseForm />} />
          </Route>

          {/* Lesson player - full screen */}
          <Route
            path="/courses/:courseSlug/player/:lessonId"
            element={<LessonPlayer />}
          />

          {/* Learner routes */}
          <Route path="/" element={<LearnerLayout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/:courseSlug" element={<CourseDetail />} />
            <Route path="my-courses" element={<MyCourses />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
