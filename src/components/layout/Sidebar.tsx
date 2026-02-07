import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Users,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";

import type { Role } from "../../types";

const navItems: Array<{
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
  roles?: Role[];
}> = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/courses", icon: BookOpen, label: "Courses" },
  {
    to: "/admin/instructors",
    icon: Users,
    label: "Instructors",
    roles: ["ADMIN"],
  },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
  {
    to: "/admin/course-requests",
    icon: CheckCircle2,
    label: "Course Requests",
    roles: ["ADMIN"],
  },
  {
    to: "/admin/instructor-requests",
    icon: UserPlus,
    label: "Instructor Requests",
    roles: ["ADMIN"],
  },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "flex flex-col h-screen bg-white border-r border-border/70 transition-all duration-300 sticky top-0",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/70">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-200/40">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-extrabold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
            LearnSphere
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(
            (item) =>
              !item.roles ||
              (user?.role && item.roles.includes(user.role as Role)),
          )
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/60 ring-1 ring-primary-100"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User */}
      <div className="border-t border-border/70 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.role || "ADMIN"}
              </p>
            </div>
          )}
          {!collapsed && (
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger-500 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
