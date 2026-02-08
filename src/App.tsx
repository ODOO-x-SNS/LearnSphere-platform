import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./pages/Login/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPassword/ResetPasswordPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { CoursesPage } from "./pages/Courses/CoursesPage";
import { CourseFormPage } from "./pages/Courses/CourseFormPage";
import { InstructorsPage } from "./pages/Instructors/InstructorsPage";
import { ReportsPage } from "./pages/Reports/ReportsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { CourseRequestsPage } from "./pages/CourseRequests/CourseRequestsPage";
import { InstructorRequestsPage } from "./pages/InstructorRequests/InstructorRequestsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id/edit" element={<CourseFormPage />} />
            <Route path="instructors" element={<InstructorsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="course-requests" element={<CourseRequestsPage />} />
            <Route path="instructor-requests" element={<InstructorRequestsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
