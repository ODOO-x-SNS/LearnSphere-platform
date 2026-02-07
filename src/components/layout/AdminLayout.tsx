import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../store/auth';
import { useMe } from '../../hooks/useApi';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLoading } = useMe();

  // Wait for useMe() to resolve first — it may trigger a token refresh via
  // the 401 interceptor, which sets isAuthenticated=true in the Zustand store.
  // Checking auth BEFORE loading settles would redirect on every hard refresh.
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-dim">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-dim">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
